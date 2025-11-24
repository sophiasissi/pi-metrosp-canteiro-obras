import cv2
import numpy as np

def comparar_formas(planta_path, foto_path):
    """
    Compara a forma entre duas imagens usando segmentação HSV e Métrica Dice.
    Salva a imagem resultante com os contornos da diferença e retorna a similaridade.
    """

    # === 1. CARREGAR E PRÉ-PROCESSAR ===
    img_ref = cv2.imread(planta_path)
    img_real = cv2.imread(foto_path)

    if img_ref is None or img_real is None:
        raise ValueError("Erro ao carregar uma das imagens. Verifique os paths.")

    img_real = cv2.resize(img_real, (img_ref.shape[1], img_ref.shape[0]))

    hsv_ref = cv2.cvtColor(img_ref, cv2.COLOR_BGR2HSV)
    hsv_real = cv2.cvtColor(img_real, cv2.COLOR_BGR2HSV)

    # === 2. SEGMENTAR OBJETOS ===
    mask_ref = cv2.inRange(hsv_ref, (0, 40, 40), (179, 255, 255))
    mask_real = cv2.inRange(hsv_real, (0, 40, 40), (179, 255, 255))

    kernel = np.ones((5,5), np.uint8)
    mask_ref = cv2.morphologyEx(mask_ref, cv2.MORPH_OPEN, kernel)
    mask_ref = cv2.morphologyEx(mask_ref, cv2.MORPH_CLOSE, kernel)
    mask_real = cv2.morphologyEx(mask_real, cv2.MORPH_OPEN, kernel)
    mask_real = cv2.morphologyEx(mask_real, cv2.MORPH_CLOSE, kernel)

    # === 3. DIFERENÇA E INTERSEÇÃO ===
    mask_diff = cv2.bitwise_xor(mask_ref, mask_real)
    mask_intersecao = cv2.bitwise_and(mask_ref, mask_real)

    # === 4. CONTORNOS E SIMILARIDADE ===
    contours, _ = cv2.findContours(mask_diff, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    result_outline = img_real.copy()
    cv2.drawContours(result_outline, contours, -1, (0, 0, 0), 2)

    pixels_intersecao = np.count_nonzero(mask_intersecao)
    pixels_total_ref = np.count_nonzero(mask_ref)
    pixels_total_real = np.count_nonzero(mask_real)

    if (pixels_total_ref + pixels_total_real) > 0:
        similaridade_dice = 100 * (2.0 * pixels_intersecao) / (pixels_total_ref + pixels_total_real)
    else:
        similaridade_dice = 0

    # === 5. GERAR RESULTADO ===
    result = cv2.addWeighted(img_real, 0.7, result_outline, 0.7, 0)
    print(f"Similaridade Dice: {similaridade_dice:.2f}%")

    return similaridade_dice
