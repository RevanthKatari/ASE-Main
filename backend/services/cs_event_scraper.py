import re
from datetime import datetime
from typing import List, Dict, Optional
from bs4 import BeautifulSoup
import requests


class CSEventScraper:
    BASE_URL = "https://www.uwindsor.ca/science/computerscience/event-calendar"
    
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })
    
    def fetch_events(self) -> List[Dict]:
        """Fetch and parse events from the UWindsor CS calendar"""
        try:
            response = self.session.get(self.BASE_URL, timeout=15)
            response.raise_for_status()
            soup = BeautifulSoup(response.content, 'lxml')
            
            events = []
            event_urls = set()
            
            # Parse "Today's CS Events" section
            today_section = soup.find('h2', string='Today\'s CS Events')
            if today_section:
                ul = today_section.find_next('ul')
                if ul:
                    for li in ul.find_all('li', recursive=False):
                        event = self._parse_event_item(li)
                        if event and event.get('event_url'):
                            event_urls.add(event['event_url'])
                            events.append(event)
            
            # Parse "CS Events" section
            cs_events_section = soup.find('h2', string='CS Events')
            if cs_events_section:
                ul = cs_events_section.find_next('ul')
                if ul:
                    for li in ul.find_all('li', recursive=False):
                        event = self._parse_event_item(li)
                        if event and event.get('event_url'):
                            url = event['event_url']
                            if url not in event_urls:
                                event_urls.add(url)
                                events.append(event)
            
            # Parse calendar events from table cells
            calendar_events = self._parse_calendar_events(soup)
            for event in calendar_events:
                if event.get('event_url') and event['event_url'] not in event_urls:
                    event_urls.add(event['event_url'])
                    events.append(event)
            
            # Fetch detailed information for each event
            detailed_events = []
            for event in events:
                if event.get('event_url'):
                    detailed = self._fetch_event_details(event['event_url'], event)
                    if detailed:
                        detailed_events.append(detailed)
                    else:
                        detailed_events.append(event)
                else:
                    detailed_events.append(event)
            
            return detailed_events
            
        except Exception as e:
            print(f"Error fetching CS events: {e}")
            import traceback
            traceback.print_exc()
            return []
    
    def _parse_event_item(self, li_element) -> Optional[Dict]:
        """Parse a single event from a <li> element"""
        try:
            # Find the link
            link = li_element.find('a')
            if not link:
                return None
            
            title = link.get_text(strip=True)
            url = link.get('href', '')
            if url and not url.startswith('http'):
                url = f"https://www.uwindsor.ca{url}"
            
            # Extract date/time from the text
            text = li_element.get_text()
            
            # Try to parse date in format: Wed, 11/26/2025 - 13:30
            date_match = re.search(r'(\w+), (\d{1,2})/(\d{1,2})/(\d{4})', text)
            time_match = re.search(r'(\d{1,2}):(\d{2})', text)
            
            event_date = None
            event_time = None
            
            if date_match:
                try:
                    month, day, year = int(date_match.group(2)), int(date_match.group(3)), int(date_match.group(4))
                    event_date = datetime(year, month, day)
                except ValueError:
                    pass
            
            if time_match:
                hour = int(time_match.group(1))
                minute = int(time_match.group(2))
                # Check for am/pm in the text
                if 'am' in text.lower() and hour == 12:
                    hour = 0
                elif 'pm' in text.lower() and hour != 12:
                    hour += 12
                event_time = f"{hour:02d}:{minute:02d}"
            
            # Extract presenter if mentioned
            presenter = None
            if 'by:' in text.lower():
                presenter_match = re.search(r'by:\s*([^0-9\n]+?)(?:\s+\d|$)', text, re.IGNORECASE | re.DOTALL)
                if presenter_match:
                    presenter = presenter_match.group(1).strip()
            
            return {
                'title': title,
                'description': text,
                'event_date': event_date,
                'event_time': event_time,
                'event_url': url if url else None,
                'presenter': presenter,
                'raw_data': {'text': text}
            }
        except Exception as e:
            print(f"Error parsing event item: {e}")
            return None
    
    def _parse_calendar_events(self, soup) -> List[Dict]:
        """Parse events from the calendar table"""
        events = []
        try:
            # Find calendar table
            calendar_table = soup.find('table')
            if not calendar_table:
                return events
            
            # Find all links in table cells that might be events
            for cell in calendar_table.find_all(['td', 'th']):
                links = cell.find_all('a', href=True)
                for link in links:
                    title = link.get_text(strip=True)
                    if title and len(title) > 10:  # Filter out short/non-event links
                        url = link.get('href', '')
                        if url and not url.startswith('http'):
                            url = f"https://www.uwindsor.ca{url}"
                        
                        # Try to extract time from parent cell
                        cell_text = cell.get_text()
                        time_match = re.search(r'(\d{1,2}):(\d{2})(am|pm)', cell_text, re.IGNORECASE)
                        
                        event_time = None
                        if time_match:
                            hour = int(time_match.group(1))
                            minute = int(time_match.group(2))
                            am_pm = time_match.group(3).lower()
                            if am_pm == 'pm' and hour != 12:
                                hour += 12
                            elif am_pm == 'am' and hour == 12:
                                hour = 0
                            event_time = f"{hour:02d}:{minute:02d}"
                        
                        # Extract presenter
                        presenter = None
                        if 'by:' in cell_text.lower():
                            presenter_match = re.search(r'by:\s*([^0-9\n]+?)(?:\s+\d|$)', cell_text, re.IGNORECASE | re.DOTALL)
                            if presenter_match:
                                presenter = presenter_match.group(1).strip()
                        
                        events.append({
                            'title': title,
                            'description': cell_text,
                            'event_date': None,  # Will be set from event detail page
                            'event_time': event_time,
                            'event_url': url,
                            'presenter': presenter,
                            'raw_data': {'text': cell_text}
                        })
        except Exception as e:
            print(f"Error parsing calendar events: {e}")
        
        return events
    
    def _fetch_event_details(self, url: str, base_event: Dict) -> Optional[Dict]:
        """Fetch detailed information from an individual event page"""
        try:
            response = self.session.get(url, timeout=15)
            response.raise_for_status()
            soup = BeautifulSoup(response.content, 'lxml')
            
            # Start with base event data
            event = base_event.copy()
            
            # Extract title (more detailed)
            title_elem = soup.find('h1')
            if title_elem:
                event['title'] = title_elem.get_text(strip=True)
            
            # Extract date and time
            date_time_text = soup.get_text()
            date_match = re.search(r'(\w+day), (\w+) (\d{1,2}), (\d{4})', date_time_text)
            time_match = re.search(r'Time:\s*(\d{1,2})\.(\d{2})\s*(am|pm)', date_time_text, re.IGNORECASE)
            
            if date_match:
                try:
                    month_name = date_match.group(2)
                    day = int(date_match.group(3))
                    year = int(date_match.group(4))
                    month = self._month_name_to_number(month_name)
                    if month:
                        event['event_date'] = datetime(year, month, day)
                except (ValueError, AttributeError):
                    pass
            
            if time_match:
                hour = int(time_match.group(1))
                minute = int(time_match.group(2))
                am_pm = time_match.group(3).lower()
                if am_pm == 'pm' and hour != 12:
                    hour += 12
                elif am_pm == 'am' and hour == 12:
                    hour = 0
                event['event_time'] = f"{hour:02d}:{minute:02d}"
            
            # Extract location
            location_match = re.search(r'Location:\s*([^\n]+)', date_time_text)
            if location_match:
                event['location'] = location_match.group(1).strip()
            
            # Extract presenter
            presenter_match = re.search(r'Presenter:\s*([^\n]+)', date_time_text)
            if presenter_match:
                event['presenter'] = presenter_match.group(1).strip()
            
            # Extract abstract
            abstract_section = soup.find(string=re.compile(r'Abstract:', re.IGNORECASE))
            if abstract_section:
                abstract_elem = abstract_section.find_next()
                if abstract_elem:
                    event['abstract'] = abstract_elem.get_text(strip=True)
            
            # Extract workshop outline
            outline_section = soup.find(string=re.compile(r'Workshop Outline:', re.IGNORECASE))
            if outline_section:
                outline_elem = outline_section.find_next()
                if outline_elem:
                    event['workshop_outline'] = outline_elem.get_text(strip=True)
            
            # Extract prerequisites
            prereq_section = soup.find(string=re.compile(r'Prerequisites:', re.IGNORECASE))
            if prereq_section:
                prereq_elem = prereq_section.find_next()
                if prereq_elem:
                    event['prerequisites'] = prereq_elem.get_text(strip=True)
            
            # Extract biography
            bio_section = soup.find(string=re.compile(r'Biography:', re.IGNORECASE))
            if bio_section:
                bio_elem = bio_section.find_next()
                if bio_elem:
                    event['biography'] = bio_elem.get_text(strip=True)
            
            # Extract registration link
            reg_link = soup.find('a', href=re.compile(r'registration|register', re.IGNORECASE))
            if reg_link:
                reg_url = reg_link.get('href', '')
                if reg_url and not reg_url.startswith('http'):
                    reg_url = f"https://www.uwindsor.ca{reg_url}"
                event['registration_link'] = reg_url
            
            return event
            
        except Exception as e:
            print(f"Error fetching event details from {url}: {e}")
            return base_event
    
    def _month_name_to_number(self, month_name: str) -> Optional[int]:
        """Convert month name to number"""
        months = {
            'january': 1, 'february': 2, 'march': 3, 'april': 4,
            'may': 5, 'june': 6, 'july': 7, 'august': 8,
            'september': 9, 'october': 10, 'november': 11, 'december': 12
        }
        return months.get(month_name.lower())

