from fastapi import APIRouter, Response
from fpdf import FPDF
import io
from datetime import datetime

# Import from the central data loader
from .data_loader import combined_df 

router = APIRouter()

# --- CSV Endpoint (No changes) ---
@router.get("/reports/csv")
def get_csv_report():
    if combined_df.empty:
        return {"error": "No data available to generate report."}
    from fastapi.responses import StreamingResponse
    stream = io.StringIO()
    combined_df.to_csv(stream, index=False)
    response = StreamingResponse(iter([stream.getvalue()]), media_type="text/csv")
    response.headers["Content-Disposition"] = f"attachment; filename=cement_ai_report_{datetime.now().strftime('%Y%m%d')}.csv"
    return response

# --- PDF Report Generation (Corrected) ---
class PDF(FPDF):
    def header(self):
        self.set_font('Helvetica', 'B', 12)
        self.cell(0, 10, 'Cement-AI Operational Report', 0, 1, 'C')
        self.set_font('Helvetica', '', 8)
        self.cell(0, 10, f"Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", 0, 1, 'C')
        self.ln(10)

    def footer(self):
        self.set_y(-15)
        self.set_font('Helvetica', 'I', 8)
        self.cell(0, 10, f'Page {self.page_no()}', 0, 0, 'C')

@router.get("/reports/pdf")
def get_pdf_report():
    if combined_df.empty:
        return {"error": "No data available to generate report."}

    pdf = PDF()
    pdf.add_page()
    pdf.set_font("Helvetica", size=10)
    pdf.cell(0, 10, 'Latest KPI Readings', 0, 1, 'L')

    pdf.set_font('Helvetica', 'B', 10)
    col_width = pdf.w / 5.5
    headers = ['SPC (kWh/t)', 'TSR (%)', 'Clinker Quality (%)', 'CO2 (t/t)']
    for header in headers:
        pdf.cell(col_width, 10, header, 1, 0, 'C')
    pdf.ln()

    pdf.set_font('Helvetica', '', 10)
    recent_data = combined_df.tail(15)
    for index, row in recent_data.iterrows():
        pdf.cell(col_width, 10, f"{row['spc']:.2f}", 1, 0, 'C')
        pdf.cell(col_width, 10, f"{row['tsr']:.2f}", 1, 0, 'C')
        pdf.cell(col_width, 10, f"{row['clinker_quality']:.2f}", 1, 0, 'C')
        pdf.cell(col_width, 10, f"{row['co2']:.2f}", 1, 0, 'C')
        pdf.ln()

    # --- THE FIX ---
    # The .output() method returns a bytearray. We explicitly convert it to bytes.
    pdf_output_bytes = bytes(pdf.output())

    headers = {
        'Content-Disposition': f'attachment; filename="cement_ai_report_{datetime.now().strftime("%Y%m%d")}.pdf"'
    }

    return Response(content=pdf_output_bytes, media_type="application/pdf", headers=headers)