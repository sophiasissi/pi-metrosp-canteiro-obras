import boto3
import uuid
import os
from awsConfig import AWS_ACCESS_KEY, AWS_SECRET_KEY, AWS_REGION, AWS_BUCKET_NAME


def _safe_filename(file):
    # Try several attributes to find a filename (works for Flask FileStorage and RN uploads)
    filename = getattr(file, 'filename', None) or getattr(file, 'name', None)
    if not filename:
        # fallback to a generic name
        filename = 'file'
    return filename


def upload_file_to_s3(file, folder=""):
    s3_client = boto3.client(
        "s3",
        aws_access_key_id=AWS_ACCESS_KEY,
        aws_secret_access_key=AWS_SECRET_KEY,
        region_name=AWS_REGION,
    )

    original_name = _safe_filename(file)
    # preserve extension
    _, ext = os.path.splitext(original_name)
    unique_name = f"{uuid.uuid4().hex}{ext or '.jpg'}"
    key = f"{folder}/{unique_name}" if folder else unique_name

    # If 'file' is a Flask FileStorage (has .stream/file-like), upload_fileobj works
    # For safety, attempt to use file.stream if available
    fileobj = getattr(file, 'stream', None) or file

    s3_client.upload_fileobj(fileobj, AWS_BUCKET_NAME, key)

    file_url = f"https://{AWS_BUCKET_NAME}.s3.{AWS_REGION}.amazonaws.com/{key}"
    return file_url

def delete_file_from_s3(file_url):
    if not file_url:
            print("URL da imagem é inválida ou vazia. Nada para deletar.")
            return False

    # Tenta extrair o KEY da URL
    if ".amazonaws.com/" in file_url:
        try:
            key = file_url.split(".amazonaws.com/")[1]
        except:
            print("Erro ao extrair key da URL:", file_url)
            return False
    else:
        # Caso esteja salva apenas a chave
        key = file_url

    print("KEY extraída:", key)

    s3_client = boto3.client(
        "s3",
        aws_access_key_id=AWS_ACCESS_KEY,
        aws_secret_access_key=AWS_SECRET_KEY,
        region_name=AWS_REGION,
    )

    try:
        s3_client.delete_object(Bucket=AWS_BUCKET_NAME, Key=key)
        print(f"Arquivo removido do S3: {key}")
        return True
    except Exception as e:
        print("Erro ao deletar do S3:", e)
        return False