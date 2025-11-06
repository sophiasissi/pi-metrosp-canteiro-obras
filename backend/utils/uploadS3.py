import boto3
from awsConfig import AWS_ACCESS_KEY, AWS_SECRET_KEY, AWS_REGION, AWS_BUCKET_NAME

def upload_file_to_s3(file, folder=""):
    s3_client = boto3.client(
        "s3",
        aws_access_key_id=AWS_ACCESS_KEY,
        aws_secret_access_key=AWS_SECRET_KEY,
        region_name=AWS_REGION,
    )

    filename = file.filename
    key = f"{folder}/{filename}" if folder else filename

    # Upload sem ACL
    s3_client.upload_fileobj(file, AWS_BUCKET_NAME, key)

    # URL pública
    file_url = f"https://{AWS_BUCKET_NAME}.s3.{AWS_REGION}.amazonaws.com/{key}"
    return file_url
