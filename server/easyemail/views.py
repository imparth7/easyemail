import json
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.core.mail import send_mail
from keycipher import decrypt_data


def home(req):
    dict = {"message": "Hello world!"}
    return HttpResponse(json.dumps(dict), content_type="text/json")


@csrf_exempt
def email(req):
    if req.method == "POST":
        try:
            data = json.loads(req.body)  # Parse JSON data from the request body
            emails = data.get("to_emails", [])  # Extract emails
            passkey = data.get("passkey", {})
            userEmail = data.get("from_email", "")

            passwordCode = decrypt_data(passkey, userEmail)

            # Respond with some confirmation or the extracted data
            response_data = {
                "status": emailSending(data, passwordCode),
                "emails": emails,
            }
            return HttpResponse(
                json.dumps(response_data), content_type="application/json"
            )

        except json.JSONDecodeError:
            return HttpResponse("Invalid JSON", status=400)

    return HttpResponse("Only POST method is allowed", status=405)


# Email Logic
def emailSending(data, password):
    # data = {
    #     "from_email": "abc@gmail.com",
    #     "to_emails": ["abc@gmail.com", "def@gmail.com"],
    #     "subject": "this is subject",
    #     "mail": "Mail msg",
    #     "isHTMLMail": true
    # }

    print(data)

    HTMLMail = data.get("isHTMLMail", False)
    subject = data["subject"]
    from_email = data["from_email"]
    fail_silently = False
    auth_user = data["from_email"]

    for i in data["to_emails"]:
        if HTMLMail:
            send_mail(
                subject,
                message=None,
                html_message=data["mail"],
                from_email=from_email,
                recipient_list=[f"{i}"],
                fail_silently=fail_silently,
                auth_user=auth_user,
                auth_password=password,
            )
        else:
            send_mail(
                subject,
                message=data["mail"],
                from_email=from_email,
                recipient_list=[f"{i}"],
                fail_silently=fail_silently,
                auth_user=auth_user,
                auth_password=password,
            )

    return "Successfully Mail sended"
