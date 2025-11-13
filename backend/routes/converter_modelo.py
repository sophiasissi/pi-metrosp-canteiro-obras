import ifcopenshell
import ifcopenshell.geom
import ezdxf
import numpy as np
import time

import matplotlib.pyplot as plt
from ezdxf.addons.drawing import RenderContext, Frontend
from ezdxf.addons.drawing.matplotlib import MatplotlibBackend


# ===========================
# FAÇA UM IF PARA VER SE O ARQUIVO ENVIADO É UM .PNG OU .JPG SE FOR NAO CONVERTER
# ===========================

def converter_ifc_para_dxf(
    caminho_ifc: str,
    arquivo_dxf_saida: str = "planta_2D.dxf"
):
    inicio = time.time()

    # 1. Abrir IFC
    ifc_file = ifcopenshell.open(caminho_ifc)

    # 2. Configurar geometria
    settings = ifcopenshell.geom.settings()

    # 3. Criar DXF
    doc = ezdxf.new(dxfversion="R2010")
    msp = doc.modelspace()

    # 4. Tipos IFC aceitos
    TIPOS_COM_GEOMETRIA = [
        "IfcWall", "IfcSlab", "IfcColumn", "IfcDoor", "IfcWindow",
        "IfcBeam", "IfcStair", "IfcRoof", "IfcCovering", "IfcBuildingElementProxy"
    ]

    contador = 0

    # 5. Processar elementos
    for tipo in TIPOS_COM_GEOMETRIA:
        for product in ifc_file.by_type(tipo):
            try:
                shape = ifcopenshell.geom.create_shape(settings, product)
                verts = np.array(shape.geometry.verts).reshape(-1, 3)
                faces = np.array(shape.geometry.faces).reshape(-1, 3)

                # 6. Projeção 2D (XY)
                for f in faces:
                    pts = [(verts[i][0], verts[i][1]) for i in f]
                    msp.add_lwpolyline(pts + [pts[0]], close=True)

                contador += 1
            except Exception:
                pass

    # 7. Salvar DXF
    doc.saveas(arquivo_dxf_saida)

    return {
        "elementos_processados": contador,
        "tempo": time.time() - inicio,
        "dxf": arquivo_dxf_saida,
    }


# ===========================
# NOVA FUNÇÃO PARA GERAR PNG
# ===========================

def gerar_png_do_dxf(arquivo_dxf: str, arquivo_png: str = "planta_2D.png"):
    # Carrega o DXF
    doc = ezdxf.readfile(arquivo_dxf)
    msp = doc.modelspace()

    # Contexto do render
    ctx = RenderContext(doc)

    # Backend matplotlib
    fig = plt.figure(figsize=(10, 8))
    ax = fig.add_subplot(1, 1, 1)
    backend = MatplotlibBackend(ax)

    # Renderizar
    Frontend(ctx, backend).draw_layout(msp, finalize=True)

    ax.set_aspect("equal")
    ax.axis("off")
    plt.tight_layout()

    plt.savefig(arquivo_png, dpi=300, bbox_inches="tight")
    plt.close()

    return arquivo_png
