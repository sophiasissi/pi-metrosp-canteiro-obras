import cv2
import numpy as np

# === CONFIGURAÇÕES ===
planta_path = "teste-branco.png"  # AJUSTAR O PATH PARA O BD
foto_path = "teste-branco-75.png" # AJUSTAR O PATH PARA O BOTÃO
saida_path = "comparacao_focada.png" # 

# === 1. CARREGAR E PRÉ-PROCESSAR ===
img_ref = cv2.imread(planta_path)
img_real = cv2.imread(foto_path)

img_real = cv2.resize(img_real, (img_ref.shape[1], img_ref.shape[0]))

hsv_ref = cv2.cvtColor(img_ref, cv2.COLOR_BGR2HSV)
hsv_real = cv2.cvtColor(img_real, cv2.COLOR_BGR2HSV)

# === 2. SEGMENTAR OBJETOS (CRIAR MÁSCARAS) ===
mask_ref = cv2.inRange(hsv_ref, (0, 40, 40), (179, 255, 255))
mask_real = cv2.inRange(hsv_real, (0, 40, 40), (179, 255, 255))

kernel = np.ones((5,5), np.uint8)
mask_ref = cv2.morphologyEx(mask_ref, cv2.MORPH_OPEN, kernel)
mask_ref = cv2.morphologyEx(mask_ref, cv2.MORPH_CLOSE, kernel)
mask_real = cv2.morphologyEx(mask_real, cv2.MORPH_OPEN, kernel)
mask_real = cv2.morphologyEx(mask_real, cv2.MORPH_CLOSE, kernel)

# === 3. CALCULAR DIFERENÇA E INTERSEÇÃO ===
# 'bitwise_xor' (Diferença) é mantido para a visualização dos contornos
mask_diff_focada = cv2.bitwise_xor(mask_ref, mask_real)

# --- MUDANÇA PARA MÉTRICA DICE ---
# 'bitwise_and' (Interseção) é necessário para o novo cálculo
mask_intersecao = cv2.bitwise_and(mask_ref, mask_real)
# A 'mask_uniao' não é mais necessária para esta métrica

# === 4. CONTORNOS E SIMILARIDADE (MÉTRICA DICE) ===
# Encontra os contornos da MÁSCARA DE DIFERENÇA ('xor') para visualização
contours, _ = cv2.findContours(mask_diff_focada, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

# Prepara a imagem de saída com contornos pretos (como no seu script)
result_outline = img_real.copy()
cv2.drawContours(result_outline, contours, -1, (0, 0, 0), 2) # Contornos em preto

# --- NOVO CÁLCULO DE SIMILARIDADE (MÉTRICA DICE) ---
# 1. Pega a área da Interseção (o que é igual)
pixels_intersecao = np.count_nonzero(mask_intersecao)

# 2. Pega as áreas totais de cada imagem
pixels_total_ref = np.count_nonzero(mask_ref)
pixels_total_real = np.count_nonzero(mask_real)

# 3. Aplica a fórmula do Coeficiente de Dice
# similaridade = 100 * (2 * Interseção) / (Total_A + Total_B)
if (pixels_total_ref + pixels_total_real) > 0:
    similaridade_dice = 100 * (2.0 * pixels_intersecao) / (pixels_total_ref + pixels_total_real)
    print(f"Similaridade (Métrica Dice): {similaridade_dice:.2f}%") # ENVIAR A SIMILARIDADE AO BANCO
else:
    print("Erro: Nenhum objeto detectado nas imagens.")
# --- FIM DA MUDANÇA ---

# === 5. EXIBIR RESULTADO ===
# Mescla a imagem original com os contornos (como no seu script)
result = cv2.addWeighted(img_real, 0.7, result_outline, 0.7, 0) # ENVIAR AO BANCO O RESULTADO PARA BAIXAREM, PERGUNTAR AO GUSTAVO

largura = 300
altura = int(result.shape[0] * (largura / result.shape[1]))
preview = cv2.resize(result, (largura, altura))

cv2.imshow("Comparação Focada na Forma", preview)
cv2.imwrite(saida_path, result)

cv2.waitKey(0)
cv2.destroyAllWindows()
print(f"Imagem de comparação salva em: {saida_path}")