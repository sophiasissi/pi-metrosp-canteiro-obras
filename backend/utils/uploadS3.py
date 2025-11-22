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

    s3_client.upload_fileobj(file, AWS_BUCKET_NAME, key)

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