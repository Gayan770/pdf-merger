import sys
from pypdf import PdfReader, PdfWriter


def interleave_pdfs(pdf1_path, pdf2_path, output_path):
    # Open both PDFs for reading
    reader1 = PdfReader(pdf1_path)
    reader2 = PdfReader(pdf2_path)

    # Create a writer object for the new merged PDF
    writer = PdfWriter()

    # Get the total number of pages for both PDFs
    total_pages_1 = len(reader1.pages)
    total_pages_2 = len(reader2.pages)

    # Find the maximum page count in case they aren't exactly the same length
    max_pages = max(total_pages_1, total_pages_2)

    # Loop through the page numbers, zipping them together
    for i in range(max_pages):
        # Add a page from PDF 1 if it still has pages left
        if i < total_pages_1:
            writer.add_page(reader1.pages[i])

        # Add a page from PDF 2 if it still has pages left
        if i < total_pages_2:
            writer.add_page(reader2.pages[i])

    # Save the result to the output file
    with open(output_path, "wb") as output_file:
        writer.write(output_file)

    print(f"Successfully merged into {output_path}")


if __name__ == "__main__":
    if len(sys.argv) < 4:
        print("Usage: python main.py <pdf1> <pdf2> <output>")
        sys.exit(1)
    interleave_pdfs(sys.argv[1], sys.argv[2], sys.argv[3])
