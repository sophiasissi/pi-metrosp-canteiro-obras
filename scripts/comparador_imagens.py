import cv2
from skimage.metrics import structural_similarity as ssim

def comparar_imagens(img_projeto_path, img_atual_path):
    # Ler imagens
    img_projeto = cv2.imread(img_projeto_path)
    img_atual = cv2.imread(img_atual_path)

    if img_projeto is None or img_atual is None:
        print("Erro: não foi possível abrir uma das imagens.")
        return

    # Redimensionar para o mesmo tamanho
    img_atual = cv2.resize(img_atual, (img_projeto.shape[1], img_projeto.shape[0]))

    # Converter para escala de cinza
    gray_projeto = cv2.cvtColor(img_projeto, cv2.COLOR_BGR2GRAY)
    gray_atual = cv2.cvtColor(img_atual, cv2.COLOR_BGR2GRAY)

    # Calcular o índice SSIM (quanto mais próximo de 1, mais similar)
    score, diff = ssim(gray_projeto, gray_atual, full=True)
    similarity_percent = score * 100

    print(f"Similaridade entre as imagens: {similarity_percent:.2f}%")

    # Normalizar o mapa de diferenças (para exibição)
    diff = (diff * 255).astype("uint8")

    # Destacar diferenças significativas (threshold)
    _, diff_thresh = cv2.threshold(diff, 200, 255, cv2.THRESH_BINARY_INV)

    # Exibir resultados
    cv2.imshow("Projeto", img_projeto)
    cv2.imshow("Atual", img_atual)
    cv2.imshow("Diferencas destacadas", diff_thresh)
    cv2.waitKey(0)
    cv2.destroyAllWindows()

# -----------------------
# Exemplo de uso:
# -----------------------
if __name__ == "__main__":
    comparar_imagens("projeto_final.jpg", "foto_atual.jpg")