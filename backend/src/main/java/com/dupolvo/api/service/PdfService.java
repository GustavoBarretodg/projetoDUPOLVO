package com.dupolvo.api.service;

import com.dupolvo.api.model.Bet;
import com.dupolvo.api.model.GameConfig;
import com.dupolvo.api.model.User;
import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;

@Service
public class PdfService {

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
    private static final Color BRAND_COLOR = new Color(0x2F, 0x89, 0xC5);

    public byte[] generateBetCardPdf(Bet bet, User user) {
        Document document = new Document(PageSize.A5);
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try {
            PdfWriter.getInstance(document, out);
            document.open();

            Font titleFont = new Font(Font.HELVETICA, 18, Font.BOLD, BRAND_COLOR);
            Font labelFont = new Font(Font.HELVETICA, 11, Font.BOLD);
            Font valueFont = new Font(Font.HELVETICA, 11, Font.NORMAL);
            Font smallFont = new Font(Font.HELVETICA, 8, Font.ITALIC, Color.GRAY);

            Paragraph title = new Paragraph("DuPolvo - Cartão de Aposta", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(14);
            document.add(title);

            GameConfig config = GameConfig.fromString(bet.getGameType());
            document.add(new Paragraph("Jogo: " + config.displayName, labelFont));

            if (bet.getBolaoId() != null) {
                document.add(new Paragraph("Bolão: " + bet.getBolaoName(), labelFont));
                if (bet.getQuotaPrice() != null) {
                    document.add(new Paragraph(String.format(new Locale("pt", "BR"), "Valor da cota: R$ %.2f", bet.getQuotaPrice()), valueFont));
                }
            }

            if (user != null) {
                document.add(new Paragraph(" "));
                document.add(new Paragraph("Apostador: " + user.getName(), valueFont));
                document.add(new Paragraph("E-mail: " + user.getEmail(), valueFont));
                document.add(new Paragraph("Telefone: " + user.getPhone(), valueFont));
            }

            document.add(new Paragraph(" "));
            String status = Boolean.TRUE.equals(bet.getMarked()) ? "Jogo Marcado" : "Aguardando confirmação de pagamento";
            document.add(new Paragraph("Status: " + status, labelFont));
            if (bet.getMarkedAt() != null) {
                document.add(new Paragraph("Marcado em: " + bet.getMarkedAt().format(DATE_FMT), valueFont));
            }

            List<Integer> numbers = bet.getBet();
            if (numbers != null && !numbers.isEmpty()) {
                document.add(new Paragraph(" "));
                document.add(buildNumberGrid(config, numbers));
            }

            document.add(new Paragraph(" "));
            Paragraph footer = new Paragraph(
                    "Cartão nº " + bet.getId() + " · Gerado em " + LocalDateTime.now().format(DATE_FMT),
                    smallFont);
            document.add(footer);

            document.close();
        } catch (DocumentException e) {
            throw new RuntimeException("Erro ao gerar PDF do cartão", e);
        }
        return out.toByteArray();
    }

    private PdfPTable buildNumberGrid(GameConfig config, List<Integer> marked) {
        PdfPTable table = new PdfPTable(10);
        table.setWidthPercentage(100);
        for (int n = config.min; n <= config.max; n++) {
            boolean isMarked = marked.contains(n);
            PdfPCell cell = new PdfPCell(new Phrase(String.format("%02d", n),
                    new Font(Font.HELVETICA, 10, isMarked ? Font.BOLD : Font.NORMAL,
                            isMarked ? Color.WHITE : Color.BLACK)));
            cell.setHorizontalAlignment(Element.ALIGN_CENTER);
            cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
            cell.setFixedHeight(24);
            cell.setBackgroundColor(isMarked ? BRAND_COLOR : Color.WHITE);
            table.addCell(cell);
        }
        return table;
    }
}
