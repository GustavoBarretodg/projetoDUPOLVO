package com.dupolvo.api.service;

import com.dupolvo.api.model.Bet;
import com.dupolvo.api.model.GameConfig;
import com.dupolvo.api.model.User;
import com.lowagie.text.*;
import com.lowagie.text.pdf.BaseFont;
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
        GameConfig config = GameConfig.fromString(bet.getGameType());
        if (config == GameConfig.LOTOFACIL && bet.getBet() != null && !bet.getBet().isEmpty()) {
            return generateLotofacilVolantePdf(bet, user);
        }
        return generateReferenceCardPdf(bet, user);
    }

    // Cartao de referencia antigo - so pros jogos que ainda nao tem layout de
    // impressao no volante (ou cota de bolao sem dezenas).
    private byte[] generateReferenceCardPdf(Bet bet, User user) {
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

    // ---------------------------------------------------------------------
    // Impressao direto no volante da Lotofacil (folha A4, volante encaixado
    // no tracejado). Todas as medidas abaixo estao em px CSS, copiadas do
    // layout "lotofacil normal" do modelo de impressao-previa-a4.css - no
    // navegador 1px impresso a 100% = 0,75pt, entao convertendo assim o PDF
    // sai na mesma posicao que o modelo. Nao mexer nos numeros sem testar
    // num volante de verdade: a maquina da loterica le pelas marcas.
    // ---------------------------------------------------------------------
    private static final float PX = 0.75f;
    private static final float A4_HEIGHT_PX = PageSize.A4.getHeight() / PX;

    // .entorno: margin 15/11, borda tracejada de 2px, conteudo 325px.
    private static final float ENTORNO_X = 15, ENTORNO_Y = 11, ENTORNO_BORDER = 2;
    private static final float ENTORNO_W = 325, ENTORNO_H = 680;
    private static final float CONTENT_X = ENTORNO_X + ENTORNO_BORDER;
    private static final float CONTENT_Y = ENTORNO_Y + ENTORNO_BORDER;

    // .cabecalho: margin-left 3, top 11 (relativo), padding-top 4, largura 317.
    private static final float HEADER_X = CONTENT_X + 3;
    private static final float HEADER_TOP = CONTENT_Y + 11 + 4;
    private static final float HEADER_W = 317;

    // .volante comeca depois dos 144px do cabecalho + os 30px de margin-top
    // de .apostas (que colapsa pra fora do volante).
    private static final float VOLANTE_X = CONTENT_X + 3;
    private static final float VOLANTE_Y = CONTENT_Y + 144 + 30;

    // Marcas de sincronismo de cima (.codigos top -18, .horizontal top -1 e
    // margin-left 8; blocos 15x10 com 8.6 de espaco). Padrao fixo do volante.
    private static final boolean[] TOP_MARKS = {false, false, true, true, true, true, false, false, false, false};
    private static final float TOP_MARK_Y = VOLANTE_Y - 18 - 1;
    private static final float TOP_MARK_X = VOLANTE_X + 8 + 8.6f;
    private static final float TOP_MARK_STEP = 15 + 8.6f;

    // Marcas da lateral esquerda (.vertical top -8): {y relativo, altura} ja
    // com as margens colapsadas de cada .area. Blocos 11px de largura,
    // impressos duas vezes (o original e uma copia 4px pra esquerda).
    private static final float SIDE_MARK_Y = VOLANTE_Y - 18 - 8;
    private static final float[][] SIDE_MARKS = {
            {7, 10},
            {26, 10}, {43, 10}, {60, 10}, {77, 10}, {94, 10},
            {121, 10}, {138, 10}, {155, 10}, {172, 10}, {189, 10},
            {217, 10}, {234, 10}, {251, 10}, {268, 10}, {285, 10},
            {313, 10},
            {343, 10},
            {374, 10},
            {397, 7}, {412, 7}, {427, 7},
    };

    // .aposta: margin-left 42.5; linha a cada 17px; quadradinho 10x5 (top 2)
    // a cada 47.2px. As 3 apostas comecam em 0, 95 e 191 dentro do volante.
    private static final float BET_X = VOLANTE_X + 42.5f;
    private static final float BET_ROW_STEP = 17, BET_COL_STEP = 10 + 37.2f;
    private static final float MARK_W = 10, MARK_H = 5, MARK_TOP = 2;

    // .linha_quantos_numeros: 15..20 dezenas, quadradinho a cada 23.6px.
    private static final float COUNT_Y = VOLANTE_Y + 288;
    private static final float COUNT_COL_STEP = 10 + 13.6f;

    private static final Color GUIDE_BORDER = new Color(0xFF, 0xCC, 0xCC);
    private static final Color GUIDE_TEXT = new Color(0xD1, 0x96, 0x96);

    private byte[] generateLotofacilVolantePdf(Bet bet, User user) {
        Document document = new Document(PageSize.A4, 0, 0, 0, 0);
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try {
            PdfWriter writer = PdfWriter.getInstance(document, out);
            document.open();
            PdfContentByte cb = writer.getDirectContent();
            BaseFont regular = BaseFont.createFont(BaseFont.HELVETICA, BaseFont.WINANSI, BaseFont.NOT_EMBEDDED);
            BaseFont bold = BaseFont.createFont(BaseFont.HELVETICA_BOLD, BaseFont.WINANSI, BaseFont.NOT_EMBEDDED);

            drawVolanteGuide(cb, regular);
            drawVolanteHeader(cb, regular, bold, bet, user);

            cb.setColorFill(Color.BLACK);
            for (int i = 0; i < TOP_MARKS.length; i++) {
                if (TOP_MARKS[i]) fillPx(cb, TOP_MARK_X + i * TOP_MARK_STEP, TOP_MARK_Y, 15, 10);
            }
            for (float[] mark : SIDE_MARKS) {
                fillPx(cb, VOLANTE_X, SIDE_MARK_Y + mark[0], 11, mark[1]);
                fillPx(cb, VOLANTE_X - 4, SIDE_MARK_Y + mark[0], 11, mark[1]);
            }

            // Na grade do volante cada linha impressa e uma coluna de dezenas,
            // de baixo pra cima: linha r, coluna c = dezena (4 - c) * 5 + r + 1.
            // (Conferido com os 3 jogos de exemplo do modelo.)
            List<Integer> numbers = bet.getBet();
            for (int r = 0; r < 5; r++) {
                for (int c = 0; c < 5; c++) {
                    if (numbers.contains((4 - c) * 5 + r + 1)) {
                        roundMarkPx(cb, BET_X + c * BET_COL_STEP, VOLANTE_Y + r * BET_ROW_STEP + MARK_TOP);
                    }
                }
            }

            int countIndex = numbers.size() - GameConfig.LOTOFACIL.minPick;
            if (countIndex >= 0 && countIndex < 6) {
                roundMarkPx(cb, BET_X + countIndex * COUNT_COL_STEP, COUNT_Y + MARK_TOP);
            }

            document.close();
        } catch (DocumentException | java.io.IOException e) {
            throw new RuntimeException("Erro ao gerar PDF do volante", e);
        }
        return out.toByteArray();
    }

    // Tracejado vermelho claro em volta do volante + aviso na vertical, igual
    // ao modelo (cor clara pra nao ser lida pela maquina).
    private void drawVolanteGuide(PdfContentByte cb, BaseFont font) {
        cb.saveState();
        cb.setColorStroke(GUIDE_BORDER);
        cb.setLineWidth(ENTORNO_BORDER * PX);
        cb.setLineDash(6 * PX, 6 * PX, 0);
        float half = ENTORNO_BORDER / 2;
        float w = ENTORNO_W + ENTORNO_BORDER, h = ENTORNO_H + ENTORNO_BORDER;
        cb.rectangle(px(ENTORNO_X + half), py(ENTORNO_Y + half + h), w * PX, h * PX);
        cb.stroke();
        cb.restoreState();

        String aviso = "O tracejado não deve aparecer no volante";
        float spacing = 2;
        float textW = font.getWidthPoint(aviso, 10) + spacing * aviso.length();
        // .aviso: left -143 e bottom 144 relativos a caixa interna, girado
        // 270deg em volta do proprio centro.
        float centerX = CONTENT_X - 143 + textW / 2;
        float centerY = CONTENT_Y + ENTORNO_H - 144 - 11.5f / 2;
        cb.saveState();
        cb.beginText();
        cb.setFontAndSize(font, 10 * PX);
        cb.setCharacterSpacing(spacing * PX);
        cb.setColorFill(GUIDE_TEXT);
        // +3.5: o ponto de ancora e a linha de base, nao o meio da letra.
        cb.showTextAligned(Element.ALIGN_CENTER, aviso, px(centerX + 3.5f), py(centerY), 90);
        cb.endText();
        cb.restoreState();
    }

    private void drawVolanteHeader(PdfContentByte cb, BaseFont regular, BaseFont bold, Bet bet, User user) {
        float centerX = HEADER_X + HEADER_W / 2;
        float y = HEADER_TOP;

        StringBuilder jogo = new StringBuilder("Jogo 1: ");
        for (int i = 0; i < bet.getBet().size(); i++) {
            if (i > 0) jogo.append(", ");
            jogo.append(String.format("%02d", bet.getBet().get(i)));
        }

        String subtitle;
        if (bet.getBolaoId() != null) {
            subtitle = "Bolão: " + bet.getBolaoName();
        } else if (user != null) {
            subtitle = user.getName();
        } else {
            subtitle = "Jogo 1";
        }

        y = headerLine(cb, bold, 12, "Lotofácil", centerX, y, 2, false);
        y = headerLine(cb, regular, 10, "Cartão nº " + bet.getId(), centerX, y, 2, true);
        y = headerLine(cb, regular, 10, "Volante 1 de 1", centerX, y, 2, false);
        y = headerLine(cb, regular, 10, subtitle, centerX, y, 2, false);
        y += 2;
        for (String line : wrapPx(regular, 8, jogo.toString(), HEADER_W)) {
            y = headerLine(cb, regular, 8, line, centerX, y, 0, false);
        }
        y += 2;
        headerLine(cb, regular, 10, "DuPolvo", centerX, y, 0.5f, true);
    }

    // Uma <div> do cabecalho: padding em cima/embaixo e line-height 1.15.
    // Devolve o y (px) onde a proxima comeca.
    private float headerLine(PdfContentByte cb, BaseFont font, float sizePx, String text,
                             float centerX, float topPx, float paddingPx, boolean underline) {
        float lineH = sizePx * 1.15f;
        float baseline = topPx + paddingPx + sizePx * 0.92f;
        cb.beginText();
        cb.setFontAndSize(font, sizePx * PX);
        cb.setColorFill(Color.BLACK);
        cb.showTextAligned(Element.ALIGN_CENTER, text, px(centerX), py(baseline), 0);
        cb.endText();
        if (underline) {
            float w = font.getWidthPoint(text, sizePx);
            cb.setColorFill(Color.BLACK);
            fillPx(cb, centerX - w / 2, baseline + sizePx * 0.1f, w, Math.max(0.7f, sizePx * 0.07f));
        }
        return topPx + paddingPx * 2 + lineH;
    }

    private List<String> wrapPx(BaseFont font, float sizePx, String text, float maxWidthPx) {
        List<String> lines = new java.util.ArrayList<>();
        StringBuilder current = new StringBuilder();
        for (String word : text.split(" ")) {
            String candidate = current.length() == 0 ? word : current + " " + word;
            if (current.length() > 0 && font.getWidthPoint(candidate, sizePx) > maxWidthPx) {
                lines.add(current.toString());
                current = new StringBuilder(word);
            } else {
                current = new StringBuilder(candidate);
            }
        }
        if (current.length() > 0) lines.add(current.toString());
        return lines;
    }

    // Quadradinho marcado (.qd.ch): 10x5 com cantos de 2px.
    private void roundMarkPx(PdfContentByte cb, float xPx, float yPx) {
        cb.setColorFill(Color.BLACK);
        cb.roundRectangle(px(xPx), py(yPx + MARK_H), MARK_W * PX, MARK_H * PX, 2 * PX);
        cb.fill();
    }

    // Retangulo em px, com (x, y) no canto de cima-esquerda como no CSS.
    private void fillPx(PdfContentByte cb, float xPx, float yPx, float wPx, float hPx) {
        cb.rectangle(px(xPx), py(yPx + hPx), wPx * PX, hPx * PX);
        cb.fill();
    }

    private float px(float xPx) {
        return xPx * PX;
    }

    // y do CSS (cresce pra baixo) -> y do PDF (cresce pra cima).
    private float py(float yPx) {
        return (A4_HEIGHT_PX - yPx) * PX;
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
