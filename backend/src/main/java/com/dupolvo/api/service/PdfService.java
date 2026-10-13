package com.dupolvo.api.service;

import com.dupolvo.api.model.Bet;
import com.dupolvo.api.model.GameConfig;
import com.dupolvo.api.model.User;
import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfContentByte;
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

    // 1mm em pontos PDF (72 pt = 1 polegada = 25.4mm).
    private static final float MM = 72f / 25.4f;

    // Largura de 83mm confirmada no manual de impressao da Spolti (software
    // de bolao/cambista) - e a largura real do volante da Caixa depois de
    // recortado. Altura e uma estimativa a partir de fotos de volantes reais
    // (sem fonte oficial), so pra manter a mesma proporcao/tamanho de papel -
    // o visual (cores, titulo) continua sendo o da DuPolvo, nao o da Caixa.
    private static final float CARD_WIDTH = 83 * MM;
    private static final float CARD_HEIGHT = 140 * MM;

    public byte[] generateBetCardPdf(Bet bet, User user) {
        Document document = new Document(new Rectangle(CARD_WIDTH, CARD_HEIGHT), 14, 14, 10, 10);
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try {
            PdfWriter writer = PdfWriter.getInstance(document, out);
            document.open();
            drawAlignmentMarks(writer);

            Font titleFont = new Font(Font.HELVETICA, 13, Font.BOLD, BRAND_COLOR);
            Font gameFont = new Font(Font.HELVETICA, 10, Font.BOLD);
            Font labelFont = new Font(Font.HELVETICA, 7, Font.BOLD);
            Font valueFont = new Font(Font.HELVETICA, 7, Font.NORMAL);
            Font smallFont = new Font(Font.HELVETICA, 6, Font.ITALIC, Color.GRAY);

            Paragraph title = new Paragraph("DuPolvo", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(2);
            document.add(title);

            GameConfig config = GameConfig.fromString(bet.getGameType());
            Paragraph game = new Paragraph(config.displayName, gameFont);
            game.setAlignment(Element.ALIGN_CENTER);
            game.setSpacingAfter(8);
            document.add(game);

            if (bet.getBolaoId() != null) {
                document.add(new Paragraph("Bolão: " + bet.getBolaoName(), labelFont));
                if (bet.getQuotaPrice() != null) {
                    document.add(new Paragraph(String.format(new Locale("pt", "BR"), "Valor da cota: R$ %.2f", bet.getQuotaPrice()), valueFont));
                }
            }

            if (user != null) {
                document.add(new Paragraph("Apostador: " + user.getName(), valueFont));
                document.add(new Paragraph("E-mail: " + user.getEmail(), valueFont));
                document.add(new Paragraph("Telefone: " + user.getPhone(), valueFont));
            }

            Paragraph statusP = new Paragraph(" ");
            statusP.setSpacingAfter(4);
            document.add(statusP);
            String status = Boolean.TRUE.equals(bet.getMarked()) ? "Jogo Marcado" : "Aguardando confirmação de pagamento";
            document.add(new Paragraph("Status: " + status, labelFont));
            if (bet.getMarkedAt() != null) {
                document.add(new Paragraph("Marcado em: " + bet.getMarkedAt().format(DATE_FMT), valueFont));
            }

            List<Integer> numbers = bet.getBet();
            if (numbers != null && !numbers.isEmpty()) {
                Paragraph gridSpacer = new Paragraph(" ");
                gridSpacer.setSpacingAfter(6);
                document.add(gridSpacer);
                document.add(buildNumberGrid(config, numbers));
            }

            Paragraph footer = new Paragraph(
                    "Cartão nº " + bet.getId() + " · Use como referência pra marcar na lotérica",
                    smallFont);
            footer.setSpacingBefore(10);
            document.add(footer);

            document.close();
        } catch (DocumentException e) {
            throw new RuntimeException("Erro ao gerar PDF do cartão", e);
        }
        return out.toByteArray();
    }

    // Quadradinhos genericos nas duas margens, so pra lembrar visualmente
    // que o cartao foi pensado pra ser recortado no tamanho do volante
    // oficial - sem copiar o padrao/posicionamento exato da Caixa, que a
    // gente nao tem como saber sem o template deles.
    private void drawAlignmentMarks(PdfWriter writer) {
        PdfContentByte canvas = writer.getDirectContent();
        canvas.setColorFill(Color.BLACK);
        float markSize = 2.2f * MM;
        float gap = 6f * MM;
        float y = CARD_HEIGHT - 6 * MM;
        while (y > 6 * MM) {
            canvas.rectangle(2f, y, markSize, markSize);
            canvas.fill();
            canvas.rectangle(CARD_WIDTH - 2f - markSize, y, markSize, markSize);
            canvas.fill();
            y -= gap;
        }
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

    // Reproduz as proporcoes do volante oficial da Caixa (colunas por jogo em
    // GameConfig.gridColumns), com celulas quadradas pretas/brancas iguais ao
    // cartao fisico - pra dar pra usar como referencia direta na hora de
    // marcar o jogo de verdade na lotérica.
    private PdfPTable buildNumberGrid(GameConfig config, List<Integer> marked) {
        int columns = config.gridColumns;
        PdfPTable table = new PdfPTable(columns);
        // Largura quase total do cartao (que ja e estreito, 83mm) - com mais
        // colunas a celula fica menor, igual aconteceria num volante real de
        // largura fixa com jogos de mais dezenas.
        table.setWidthPercentage(96f);
        table.setHorizontalAlignment(Element.ALIGN_CENTER);

        for (int n = config.min; n <= config.max; n++) {
            boolean isMarked = marked.contains(n);
            PdfPCell cell = new PdfPCell(new Phrase(String.format("%02d", n),
                    new Font(Font.HELVETICA, 7, Font.BOLD,
                            isMarked ? Color.WHITE : Color.BLACK)));
            cell.setHorizontalAlignment(Element.ALIGN_CENTER);
            cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
            cell.setFixedHeight(18);
            cell.setBorderWidth(0.6f);
            cell.setBorderColor(Color.BLACK);
            cell.setBackgroundColor(isMarked ? BRAND_COLOR : Color.WHITE);
            table.addCell(cell);
        }
        return table;
    }
}
