import pptxgen from "pptxgenjs";

const pptx = new pptxgen();

pptx.author = "OpenAI Codex";
pptx.company = "Datacom Forage";
pptx.subject = "Task 3 Agentic AI Presentation";
pptx.title = "OrderBot - Automating Business Analysis with Agentic AI";
pptx.lang = "en-NZ";
pptx.layout = "LAYOUT_WIDE";
pptx.theme = {
  headFontFace: "Aptos Display",
  bodyFontFace: "Aptos",
  lang: "en-NZ"
};

const colors = {
  navy: "17324D",
  blue: "2F6FED",
  green: "1E8E5A",
  amber: "C47A00",
  red: "C62828",
  ink: "1F2937",
  slate: "5B6B7B",
  pale: "F4F7FB",
  white: "FFFFFF",
  line: "D9E2EC"
};

function addTitle(slide, title, subtitle) {
  slide.addText(title, {
    x: 0.55,
    y: 0.28,
    w: 10.8,
    h: 0.5,
    fontFace: "Aptos Display",
    fontSize: 24,
    bold: true,
    color: colors.navy
  });

  if (subtitle) {
    slide.addText(subtitle, {
      x: 0.55,
      y: 0.82,
      w: 11,
      h: 0.3,
      fontSize: 10.5,
      color: colors.slate
    });
  }
}

function addBulletList(slide, items, x, y, w, h, color = colors.ink, fontSize = 15) {
  const runs = [];
  for (const item of items) {
    runs.push({
      text: item,
      options: { bullet: { indent: 12 } }
    });
  }

  slide.addText(runs, {
    x,
    y,
    w,
    h,
    fontSize,
    color,
    breakLine: true,
    paraSpaceAfterPt: 10,
    valign: "top",
    margin: 0.03
  });
}

function drawFlowRow(slide, steps, opts = {}) {
  const {
    x = 0.6,
    y = 1.7,
    boxW = 1.7,
    boxH = 0.72,
    gap = 0.22,
    fill = "EDF3FF",
    line = colors.blue,
    textColor = colors.navy,
    fontSize = 12
  } = opts;

  steps.forEach((step, index) => {
    const boxX = x + index * (boxW + gap);
    slide.addShape(pptx.ShapeType.roundRect, {
      x: boxX,
      y,
      w: boxW,
      h: boxH,
      rectRadius: 0.08,
      fill: { color: fill },
      line: { color: line, width: 1.25 }
    });
    slide.addText(step, {
      x: boxX + 0.07,
      y: y + 0.1,
      w: boxW - 0.14,
      h: boxH - 0.16,
      align: "center",
      valign: "mid",
      fontSize,
      color: textColor,
      bold: true,
      margin: 0.02
    });

    if (index < steps.length - 1) {
      const arrowX = boxX + boxW;
      slide.addShape(pptx.ShapeType.chevron, {
        x: arrowX + 0.03,
        y: y + 0.21,
        w: gap - 0.05,
        h: 0.28,
        fill: { color: line },
        line: { color: line, width: 0.5 }
      });
    }
  });
}

function addDecisionSplit(slide, {
  diamondX,
  diamondY,
  leftLabel,
  rightLabel,
  leftBoxText,
  rightBoxText,
  leftColor,
  rightColor
}) {
  slide.addShape(pptx.ShapeType.diamond, {
    x: diamondX,
    y: diamondY,
    w: 1.2,
    h: 0.82,
    fill: { color: "FFF4E5" },
    line: { color: colors.amber, width: 1.25 }
  });
  slide.addText("Decision", {
    x: diamondX + 0.13,
    y: diamondY + 0.24,
    w: 0.94,
    h: 0.2,
    align: "center",
    fontSize: 12,
    bold: true,
    color: "8A5A00"
  });

  slide.addText(leftLabel, {
    x: diamondX - 1.45,
    y: diamondY + 0.17,
    w: 0.8,
    h: 0.2,
    fontSize: 10.5,
    color: colors.slate,
    italic: true
  });
  slide.addText(rightLabel, {
    x: diamondX + 1.25,
    y: diamondY + 0.17,
    w: 0.9,
    h: 0.2,
    fontSize: 10.5,
    color: colors.slate,
    italic: true
  });

  slide.addShape(pptx.ShapeType.line, {
    x: diamondX - 0.75,
    y: diamondY + 0.4,
    w: 0.75,
    h: 0,
    line: { color: leftColor, width: 1.5, beginArrowType: "none", endArrowType: "triangle" }
  });
  slide.addShape(pptx.ShapeType.line, {
    x: diamondX + 1.2,
    y: diamondY + 0.4,
    w: 0.78,
    h: 0,
    line: { color: rightColor, width: 1.5, beginArrowType: "none", endArrowType: "triangle" }
  });

  slide.addShape(pptx.ShapeType.roundRect, {
    x: diamondX - 2.7,
    y: diamondY - 0.1,
    w: 1.75,
    h: 1.0,
    rectRadius: 0.08,
    fill: { color: "FDECEC" },
    line: { color: leftColor, width: 1.25 }
  });
  slide.addText(leftBoxText, {
    x: diamondX - 2.62,
    y: diamondY + 0.08,
    w: 1.58,
    h: 0.68,
    fontSize: 11,
    align: "center",
    valign: "mid",
    color: colors.red,
    bold: true
  });

  slide.addShape(pptx.ShapeType.roundRect, {
    x: diamondX + 2.0,
    y: diamondY - 0.1,
    w: 1.95,
    h: 1.0,
    rectRadius: 0.08,
    fill: { color: "E9F7EF" },
    line: { color: rightColor, width: 1.25 }
  });
  slide.addText(rightBoxText, {
    x: diamondX + 2.08,
    y: diamondY + 0.08,
    w: 1.78,
    h: 0.68,
    fontSize: 11,
    align: "center",
    valign: "mid",
    color: colors.green,
    bold: true
  });
}

// Slide 1
{
  const slide = pptx.addSlide();
  slide.background = { color: colors.white };
  addTitle(
    slide,
    "The Problem: Our Current Order Process Is a Bottleneck",
    "Current state analysis of the manual hardware order workflow"
  );

  drawFlowRow(slide, [
    "Sales Rep Emails\nPDF Order",
    "Shared Inbox\nReceives Order",
    "Ops Reads PDF\nManually",
    "Checks Account\nin Salesforce",
    "Checks Stock in\nGoogle Sheets"
  ], {
    x: 0.5,
    y: 1.5,
    boxW: 2.05,
    boxH: 0.85,
    gap: 0.16,
    fill: "FFF4F4",
    line: colors.red,
    textColor: "7B1F1F",
    fontSize: 12
  });

  addDecisionSplit(slide, {
    diamondX: 5.45,
    diamondY: 2.75,
    leftLabel: "If problem",
    rightLabel: "If valid",
    leftBoxText: "Email sales rep\nand wait",
    rightBoxText: "Send customer +\nwarehouse emails",
    leftColor: colors.red,
    rightColor: colors.green
  });

  slide.addShape(pptx.ShapeType.roundRect, {
    x: 0.55,
    y: 4.08,
    w: 5.55,
    h: 2.68,
    rectRadius: 0.08,
    fill: { color: colors.pale },
    line: { color: colors.line, width: 1 }
  });
  slide.addText("Key Pain Points", {
    x: 0.8,
    y: 4.28,
    w: 2.2,
    h: 0.28,
    fontSize: 17,
    bold: true,
    color: colors.navy
  });
  addBulletList(slide, [
    "Multiple manual handoffs slow down every order",
    "Staff switch between Email, PDFs, Salesforce, and Sheets",
    "Copying and checking data manually increases error risk",
    "Exception cases depend on email back-and-forth and cause long delays",
    "Orders stall when staff are unavailable or inbox volume spikes"
  ], 0.82, 4.65, 4.95, 1.85, colors.ink, 14);

  slide.addShape(pptx.ShapeType.roundRect, {
    x: 6.35,
    y: 4.08,
    w: 6.35,
    h: 2.68,
    rectRadius: 0.08,
    fill: { color: "F9FBFD" },
    line: { color: colors.line, width: 1 }
  });
  slide.addText("Illustrative Metrics", {
    x: 6.62,
    y: 4.28,
    w: 2.6,
    h: 0.28,
    fontSize: 17,
    bold: true,
    color: colors.navy
  });
  slide.addText("10 to 15 min", {
    x: 6.7,
    y: 4.72,
    w: 2.3,
    h: 0.45,
    fontSize: 24,
    bold: true,
    color: colors.red
  });
  slide.addText("average handling time per order", {
    x: 6.7,
    y: 5.12,
    w: 2.8,
    h: 0.2,
    fontSize: 11.5,
    color: colors.slate
  });
  slide.addText("Hours", {
    x: 9.05,
    y: 4.72,
    w: 1.1,
    h: 0.45,
    fontSize: 24,
    bold: true,
    color: colors.amber
  });
  slide.addText("possible delay when an exception needs clarification", {
    x: 9.05,
    y: 5.12,
    w: 2.9,
    h: 0.35,
    fontSize: 11.5,
    color: colors.slate
  });
  slide.addText("High", {
    x: 6.72,
    y: 5.72,
    w: 0.8,
    h: 0.4,
    fontSize: 22,
    bold: true,
    color: colors.blue
  });
  slide.addText("dependency on specific ops staff availability", {
    x: 7.45,
    y: 5.84,
    w: 4.3,
    h: 0.22,
    fontSize: 11.5,
    color: colors.slate
  });
}

// Slide 2
{
  const slide = pptx.addSlide();
  slide.background = { color: colors.white };
  addTitle(
    slide,
    "The Solution: Introducing OrderBot, Our Autonomous AI Agent",
    "A conceptual agentic workflow that automates standard order handling end-to-end"
  );

  drawFlowRow(slide, [
    "New Email\nDetected",
    "Parse PDF\nOrder Form",
    "Check Account\nin Salesforce",
    "Check Inventory\nin Sheets"
  ], {
    x: 0.52,
    y: 1.48,
    boxW: 2.32,
    boxH: 0.86,
    gap: 0.18,
    fill: "EEF7F2",
    line: colors.green,
    textColor: "155C3B",
    fontSize: 12
  });

  addDecisionSplit(slide, {
    diamondX: 5.45,
    diamondY: 2.72,
    leftLabel: "Exception case",
    rightLabel: "Successful case",
    leftBoxText: "Notify sales rep or\nops team for review",
    rightBoxText: "Send confirmation +\nfulfilment request",
    leftColor: colors.amber,
    rightColor: colors.green
  });

  slide.addShape(pptx.ShapeType.roundRect, {
    x: 0.55,
    y: 4.0,
    w: 5.7,
    h: 2.82,
    rectRadius: 0.08,
    fill: { color: colors.pale },
    line: { color: colors.line, width: 1 }
  });
  slide.addText("How OrderBot Works", {
    x: 0.82,
    y: 4.22,
    w: 2.8,
    h: 0.28,
    fontSize: 17,
    bold: true,
    color: colors.navy
  });
  addBulletList(slide, [
    "Monitors the shared inbox continuously for new order emails",
    "Extracts customer and product details from attached PDFs",
    "Checks account status in Salesforce and stock in Google Sheets",
    "Chooses either an auto-complete path or a human-review exception path",
    "Logs every outcome for traceability and future optimisation"
  ], 0.84, 4.58, 5.05, 1.95, colors.ink, 14);

  slide.addShape(pptx.ShapeType.roundRect, {
    x: 6.5,
    y: 4.0,
    w: 6.15,
    h: 2.82,
    rectRadius: 0.08,
    fill: { color: "F9FBFD" },
    line: { color: colors.line, width: 1 }
  });
  slide.addText("Agent Design Summary", {
    x: 6.75,
    y: 4.22,
    w: 3.2,
    h: 0.28,
    fontSize: 17,
    bold: true,
    color: colors.navy
  });
  addBulletList(slide, [
    "Goal: process new hardware orders within 5 minutes at 99.5% target accuracy",
    "Perception tools: Email API, PDF parser, Salesforce API, Google Sheets API",
    "Action tools: send confirmations, warehouse requests, and exception notifications",
    "Learning loop: identify recurring error patterns and improve exception routing"
  ], 6.78, 4.58, 5.45, 1.9, colors.ink, 13.5);
}

// Slide 3
{
  const slide = pptx.addSlide();
  slide.background = { color: colors.white };
  addTitle(
    slide,
    "Business Impact & Recommended Next Steps",
    "A low-risk pathway to validate value before full operational rollout"
  );

  slide.addShape(pptx.ShapeType.roundRect, {
    x: 0.55,
    y: 1.35,
    w: 12.2,
    h: 1.32,
    rectRadius: 0.08,
    fill: { color: "EAF3FF" },
    line: { color: "B7D0F7", width: 1 }
  });
  slide.addText("OrderBot shifts order processing from a person-dependent manual workflow to a faster, more consistent, and scalable operating model.", {
    x: 0.85,
    y: 1.72,
    w: 11.6,
    h: 0.45,
    align: "center",
    fontSize: 19,
    bold: true,
    color: colors.navy
  });

  const metricCards = [
    { x: 0.65, color: colors.green, big: "Minutes", small: "rather than 10-15 minutes per order" },
    { x: 3.75, color: colors.blue, big: "Fewer errors", small: "less manual reading and cross-checking" },
    { x: 6.85, color: colors.amber, big: "More capacity", small: "ops time freed for exceptions and service" },
    { x: 9.95, color: colors.red, big: "Faster replies", small: "quicker confirmations improve customer experience" }
  ];

  for (const card of metricCards) {
    slide.addShape(pptx.ShapeType.roundRect, {
      x: card.x,
      y: 3.02,
      w: 2.5,
      h: 1.45,
      rectRadius: 0.08,
      fill: { color: "FFFFFF" },
      line: { color: colors.line, width: 1 }
    });
    slide.addText(card.big, {
      x: card.x + 0.15,
      y: 3.26,
      w: 2.2,
      h: 0.34,
      align: "center",
      fontSize: 20,
      bold: true,
      color: card.color
    });
    slide.addText(card.small, {
      x: card.x + 0.18,
      y: 3.74,
      w: 2.14,
      h: 0.42,
      align: "center",
      fontSize: 11.2,
      color: colors.slate
    });
  }

  slide.addShape(pptx.ShapeType.roundRect, {
    x: 0.55,
    y: 4.95,
    w: 6.0,
    h: 1.95,
    rectRadius: 0.08,
    fill: { color: colors.pale },
    line: { color: colors.line, width: 1 }
  });
  slide.addText("Recommended Next Step", {
    x: 0.82,
    y: 5.18,
    w: 2.8,
    h: 0.28,
    fontSize: 17,
    bold: true,
    color: colors.navy
  });
  addBulletList(slide, [
    "Run a read-only proof of concept first",
    "Let OrderBot monitor emails, parse PDFs, and recommend decisions",
    "Keep human staff responsible for final actions during validation",
    "Measure time saved, recommendation accuracy, and exception frequency"
  ], 0.84, 5.52, 5.15, 1.15, colors.ink, 13.5);

  slide.addShape(pptx.ShapeType.roundRect, {
    x: 6.75,
    y: 4.95,
    w: 6.0,
    h: 1.95,
    rectRadius: 0.08,
    fill: { color: "F9FBFD" },
    line: { color: colors.line, width: 1 }
  });
  slide.addText("Success Measures", {
    x: 7.02,
    y: 5.18,
    w: 2.4,
    h: 0.28,
    fontSize: 17,
    bold: true,
    color: colors.navy
  });
  addBulletList(slide, [
    "99.5% target decision accuracy",
    "Faster order acknowledgement and fulfilment initiation",
    "Lower manual workload for operations",
    "Clear audit trail for every order decision"
  ], 7.04, 5.52, 5.1, 1.1, colors.ink, 13.5);
}

await pptx.writeFile({ fileName: "OrderBot_Agentic_AI_Presentation.pptx" });
