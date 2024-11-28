from typing import Optional, List, Union
import requests
import os
from dotenv import load_dotenv
from jinja2 import Template

load_dotenv()

def read_template(file_path: str) -> str:
    """
    Read the HTML template file
    """
    with open(file_path, 'r') as file:
        return file.read()

def send_email_mailgun(
    subject: str,
    to_emails: Union[str, List[str]],
    from_email: str,
    api_key: str,
    domain: str,
    template_path: Optional[str] = 'src/email_template.html',
    template_vars: Optional[dict] = None,
    text_content: Optional[str] = None
) -> bool:
    """
    Send an email using Mailgun
    
    Args:
        subject: Email subject
        to_emails: Single email address or list of email addresses
        from_email: Sender email address
        api_key: Mailgun API key
        domain: Mailgun domain (e.g., 'sandbox123.mailgun.org')
        template_path: Path to HTML template file
        template_vars: Dictionary of variables to pass to the template
        text_content: Optional plain text content
    
    Returns:
        bool: True if email was sent successfully, False otherwise
    """
    try:
        # Convert single email to list
        if isinstance(to_emails, str):
            to_emails = [to_emails]
            
        # Read the HTML template
        template_content = read_template(template_path)
        
        # Create Jinja2 template and render with variables
        template = Template(template_content)
        html_content = template.render(**template_vars) if template_vars else template_content
        
        # Prepare the data payload
        data = {
            "from": from_email,
            "to": to_emails,
            "subject": subject,
            "html": html_content,
        }
        
        # Add text content if provided
        if text_content:
            data["text"] = text_content
            
        # Send the email
        response = requests.post(
            f"https://api.mailgun.net/v3/{domain}/messages",
            auth=("api", api_key),
            data=data
        )
        
        # Check if the email was sent successfully
        if response.status_code == 200:
            print("Email sent successfully!")
            print(response.json())
            return True
        else:
            print(f"Failed to send email. Status code: {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"An error occurred: {str(e)}")
        return False

