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
import java.util.Map;

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

    // Um unico PDF consolidado, com uma linha de tabela por jogo pendente -
    // usado pelo "Imprimir tudo" (usuario e admin), em vez de um PDF por
    // cartao. showBettor liga a coluna de apostador (usada so pelo admin,
    // que ve jogos de varios usuarios).
    public byte[] generatePendingSummaryPdf(List<Bet> bets, Map<Long, User> usersByUserId, boolean showBettor) {
        Document document = new Document(PageSize.A4, 24, 24, 36, 36);
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try {
            PdfWriter.getInstance(document, out);
            document.open();

            Font titleFont = new Font(Font.HELVETICA, 18, Font.BOLD, BRAND_COLOR);
            Font headFont = new Font(Font.HELVETICA, 10, Font.BOLD, Color.WHITE);
            Font cellFont = new Font(Font.HELVETICA, 9, Font.NORMAL);
            Font smallFont = new Font(Font.HELVETICA, 8, Font.ITALIC, Color.GRAY);

            Paragraph title = new Paragraph("DuPolvo - Jogos Pendentes", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);

            Paragraph subtitle = new Paragraph(
                    bets.size() + (bets.size() == 1 ? " jogo aguardando confirmação" : " jogos aguardando confirmação")
                            + " · gerado em " + LocalDateTime.now().format(DATE_FMT),
                    smallFont);
            subtitle.setAlignment(Element.ALIGN_CENTER);
            subtitle.setSpacingAfter(16);
            document.add(subtitle);

            PdfPTable table = new PdfPTable(showBettor ? 4 : 3);
            table.setWidthPercentage(100);
            table.setWidths(showBettor ? new float[]{12, 18, 42, 28} : new float[]{15, 25, 60});

            addHeaderCell(table, "Cartão", headFont);
            addHeaderCell(table, "Jogo", headFont);
            addHeaderCell(table, "Dezenas / Bolão", headFont);
            if (showBettor) addHeaderCell(table, "Apostador", headFont);

            for (Bet bet : bets) {
                GameConfig config = GameConfig.fromString(bet.getGameType());

                table.addCell(dataCell("#" + bet.getId(), cellFont));
                table.addCell(dataCell(config.displayName, cellFont));

                String numbersOrBolao;
                if (bet.getBolaoId() != null) {
                    numbersOrBolao = "Cota do bolão " + bet.getBolaoName();
                } else if (bet.getBet() != null && !bet.getBet().isEmpty()) {
                    StringBuilder sb = new StringBuilder();
                    for (Integer n : bet.getBet()) {
                        if (sb.length() > 0) sb.append(", ");
                        sb.append(String.format("%02d", n));
                    }
                    numbersOrBolao = sb.toString();
                } else {
                    numbersOrBolao = "-";
                }
                table.addCell(dataCell(numbersOrBolao, cellFont));

                if (showBettor) {
                    User user = usersByUserId.get(bet.getIdUser());
                    String bettor = user != null ? user.getName() + "\n" + user.getEmail() : "-";
                    table.addCell(dataCell(bettor, cellFont));
                }
            }

            document.add(table);
            document.close();
        } catch (DocumentException e) {
            throw new RuntimeException("Erro ao gerar PDF dos jogos pendentes", e);
        }
        return out.toByteArray();
    }

    private PdfPCell dataCell(String text, Font font) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setPadding(6);
        cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        return cell;
    }

    private void addHeaderCell(PdfPTable table, String text, Font font) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setBackgroundColor(BRAND_COLOR);
        cell.setPadding(6);
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        table.addCell(cell);
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
