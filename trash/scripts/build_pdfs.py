import html
import re
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    PageBreak,
    Paragraph,
    Preformatted,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

root = Path(__file__).resolve().parents[2]
output_dir = root / "reports"
output_dir.mkdir(parents=True, exist_ok=True)

pdfmetrics.registerFont(
    TTFont("Arial", "/System/Library/Fonts/Supplemental/Arial.ttf")
)
pdfmetrics.registerFont(
    TTFont("Arial-Bold", "/System/Library/Fonts/Supplemental/Arial Bold.ttf")
)

styles = getSampleStyleSheet()
body = ParagraphStyle(
    "Body",
    parent=styles["BodyText"],
    fontName="Arial",
    fontSize=9.5,
    leading=13.5,
    spaceAfter=5,
    textColor=colors.HexColor("#263238"),
)
heading1 = ParagraphStyle(
    "Heading1",
    parent=styles["Heading1"],
    fontName="Arial-Bold",
    fontSize=19,
    leading=23,
    textColor=colors.HexColor("#12355B"),
    spaceBefore=7,
    spaceAfter=10,
)
heading2 = ParagraphStyle(
    "Heading2",
    parent=styles["Heading2"],
    fontName="Arial-Bold",
    fontSize=13,
    leading=17,
    textColor=colors.HexColor("#176B87"),
    spaceBefore=9,
    spaceAfter=6,
    keepWithNext=True,
)
heading3 = ParagraphStyle(
    "Heading3",
    parent=styles["Heading3"],
    fontName="Arial-Bold",
    fontSize=10.5,
    leading=14,
    textColor=colors.HexColor("#12355B"),
    spaceBefore=7,
    spaceAfter=4,
    keepWithNext=True,
)
bullet = ParagraphStyle(
    "Bullet",
    parent=body,
    leftIndent=14,
    firstLineIndent=-8,
    bulletIndent=4,
    spaceAfter=3,
)
quote = ParagraphStyle(
    "Quote",
    parent=body,
    leftIndent=12,
    rightIndent=8,
    borderColor=colors.HexColor("#90A4AE"),
    borderWidth=0,
    borderPadding=6,
    backColor=colors.HexColor("#F3F6F8"),
)
code_style = ParagraphStyle(
    "Code",
    fontName="Courier",
    fontSize=7.2,
    leading=9.2,
    leftIndent=7,
    rightIndent=7,
    borderPadding=7,
    backColor=colors.HexColor("#F3F6F8"),
    textColor=colors.HexColor("#263238"),
)
table_header = ParagraphStyle(
    "TableHeader",
    parent=body,
    fontName="Arial-Bold",
    fontSize=7,
    leading=9,
    textColor=colors.white,
)
table_body = ParagraphStyle(
    "TableBody",
    parent=body,
    fontSize=7,
    leading=9,
)


def inline_markdown(text):
    text = re.sub(r"\[([^]]+)\]\(([^)]+)\)", r"\1 (\2)", text)
    text = html.escape(text)
    text = re.sub(r"\*\*([^*]+)\*\*", r"<b>\1</b>", text)
    text = re.sub(r"`([^`]+)`", r'<font name="Courier">\1</font>', text)
    return text


def is_table_separator(line):
    cells = [cell.strip() for cell in line.strip().strip("|").split("|")]
    return bool(cells) and all(re.fullmatch(r":?-{3,}:?", cell) for cell in cells)


def markdown_story(path):
    lines = path.read_text(encoding="utf-8").splitlines()
    story = []
    index = 0
    paragraph_lines = []

    def flush_paragraph():
        if paragraph_lines:
            text = " ".join(line.strip() for line in paragraph_lines)
            story.append(Paragraph(inline_markdown(text), body))
            paragraph_lines.clear()

    while index < len(lines):
        line = lines[index]

        if line.startswith("```"):
            flush_paragraph()
            index += 1
            code_lines = []
            while index < len(lines) and not lines[index].startswith("```"):
                code_lines.append(lines[index])
                index += 1
            story.append(Preformatted("\n".join(code_lines), code_style))
            story.append(Spacer(1, 5))
        elif line.startswith("### "):
            flush_paragraph()
            story.append(Paragraph(inline_markdown(line[4:]), heading3))
        elif line.startswith("## "):
            flush_paragraph()
            story.append(Paragraph(inline_markdown(line[3:]), heading2))
        elif line.startswith("# "):
            flush_paragraph()
            if story:
                story.append(PageBreak())
            story.append(Paragraph(inline_markdown(line[2:]), heading1))
        elif line.startswith("- "):
            flush_paragraph()
            story.append(
                Paragraph(inline_markdown(line[2:]), bullet, bulletText="•")
            )
        elif re.match(r"^\d+\. ", line):
            flush_paragraph()
            number, text = line.split(". ", 1)
            story.append(
                Paragraph(inline_markdown(text), bullet, bulletText=f"{number}.")
            )
        elif line.startswith("> "):
            flush_paragraph()
            story.append(Paragraph(inline_markdown(line[2:]), quote))
        elif line.startswith("|") and index + 1 < len(lines) and is_table_separator(lines[index + 1]):
            flush_paragraph()
            table_lines = [line]
            index += 2
            while index < len(lines) and lines[index].startswith("|"):
                table_lines.append(lines[index])
                index += 1
            index -= 1
            rows = []
            for row_index, table_line in enumerate(table_lines):
                cells = table_line.strip().strip("|").split("|")
                cell_style = table_header if row_index == 0 else table_body
                rows.append(
                    [Paragraph(inline_markdown(cell.strip()), cell_style) for cell in cells]
                )
            available_width = A4[0] - 34 * mm
            column_widths = [available_width / len(rows[0])] * len(rows[0])
            table = Table(rows, colWidths=column_widths, repeatRows=1, hAlign="LEFT")
            table.setStyle(
                TableStyle(
                    [
                        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#176B87")),
                        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                        ("FONTNAME", (0, 0), (-1, 0), "Arial-Bold"),
                        ("FONTSIZE", (0, 0), (-1, -1), 7),
                        ("VALIGN", (0, 0), (-1, -1), "TOP"),
                        ("GRID", (0, 0), (-1, -1), 0.35, colors.HexColor("#B0BEC5")),
                        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#F5F8FA")]),
                        ("LEFTPADDING", (0, 0), (-1, -1), 4),
                        ("RIGHTPADDING", (0, 0), (-1, -1), 4),
                        ("TOPPADDING", (0, 0), (-1, -1), 4),
                        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
                    ]
                )
            )
            story.append(table)
            story.append(Spacer(1, 7))
        elif not line.strip():
            flush_paragraph()
        else:
            paragraph_lines.append(line)

        index += 1

    flush_paragraph()
    return story


def build_pdf(markdown_path, pdf_path, document_label):
    def draw_page(canvas, document):
        canvas.saveState()
        canvas.setFont("Arial", 7.5)
        canvas.setFillColor(colors.HexColor("#607D8B"))
        canvas.drawString(17 * mm, 287 * mm, f"23127081 - Nguyen Phan Hung Linh - {document_label}")
        canvas.drawRightString(193 * mm, 12 * mm, f"Page {document.page}")
        canvas.setStrokeColor(colors.HexColor("#CFD8DC"))
        canvas.line(17 * mm, 284 * mm, 193 * mm, 284 * mm)
        canvas.restoreState()

    document = SimpleDocTemplate(
        str(pdf_path),
        pagesize=A4,
        rightMargin=17 * mm,
        leftMargin=17 * mm,
        topMargin=17 * mm,
        bottomMargin=18 * mm,
        title=document_label,
        author="Nguyen Phan Hung Linh - 23127081",
    )
    document.build(
        markdown_story(markdown_path),
        onFirstPage=draw_page,
        onLaterPages=draw_page,
    )


documents = [
    (root / "reports" / "MAIN_REPORT.md", output_dir / "23127081_HW04_Main_Report.pdf", "HW04 Main Report"),
    (root / "reports" / "AI_AUDIT_REPORT.md", output_dir / "23127081_AI_Audit_Report.pdf", "AI Audit Report"),
    (root / "reports" / "AI_CRITIQUE.md", output_dir / "23127081_AI_Critique.pdf", "AI Critique"),
]

for markdown_path, pdf_path, label in documents:
    build_pdf(markdown_path, pdf_path, label)
    print(pdf_path)
