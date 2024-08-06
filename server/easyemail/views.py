import json
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.core.mail import send_mail


def home(req):
    dict = {"message": "Hello world!"}
    return HttpResponse(json.dumps(dict), content_type="text/json")


@csrf_exempt
def email(req):
    if req.method == "POST":
        try:
            data = json.loads(req.body)  # Parse JSON data from the request body
            emails = data.get("to_emails", [])  # Extract emails

            # Respond with some confirmation or the extracted data
            response_data = {"status": emailSending(data), "emails": emails}
            return HttpResponse(
                json.dumps(response_data), content_type="application/json"
            )

        except json.JSONDecodeError:
            return HttpResponse("Invalid JSON", status=400)

    return HttpResponse("Only POST method is allowed", status=405)


# Email Logic
def emailSending(data):
    # data = {
    #     "from_email": "abc@gmail.com",
    #     "to_emails": ["abc@gmail.com", "def@gmail.com"],
    #     "subject": "this is subject",
    #     "mail": "Mail msg",
    #     "isHTMLMail": true
    # }

    HTMLMail = data.get("isHTMLMail", False)

    for i in data["to_emails"]:
        if HTMLMail:
            send_mail(
                subject=data["subject"],
                message=None,
                html_message=data["mail"],
                from_email=data["from_email"],
                recipient_list=[f"{i}"],
                fail_silently=False,
            )
        else:
            send_mail(
                subject=data["subject"],
                message=data["mail"],
                from_email=data["from_email"],
                recipient_list=[f"{i}"],
                fail_silently=False,
            )

    return "Successfully Mail sended"
