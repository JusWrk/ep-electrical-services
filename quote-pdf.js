export async function buildQuotePdf(PDFLib, quote, logoBytes) {
  const { PDFDocument, StandardFonts, rgb } = PDFLib;
  const pdf = await PDFDocument.create();
  pdf.setTitle(quote.reference ? `Juswrk quotation ${quote.reference}` : 'Juswrk electrical quotation');
  pdf.setAuthor('Juswrk');
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const teal = rgb(0.03, 0.5, 0.5), ink = rgb(0.1, 0.24, 0.25);
  const logo = logoBytes ? await pdf.embedPng(logoBytes) : null;
  const clean = text => String(text || '').replace(/[\u2010-\u2015]/g, '-').replace(/\u202f/g, ' ').replace(/[^\x20-\x7e\xa0-\xff\n]/g, ' ');
  let page, y;
  function newPage() {
    page = pdf.addPage([595.28, 841.89]);
    if (logo) page.drawImage(logo, { x:44, y:758, width:180, height:180*logo.height/logo.width });
    else page.drawText('Juswrk - Getting you connected', {x:44,y:790,size:17,font:bold,color:teal});
    page.drawText('07799 123 067', {x:425,y:787,size:11,font:bold,color:teal});
    page.drawLine({start:{x:44,y:746},end:{x:551,y:746},thickness:1,color:teal});
    y=720;
  }
  function paragraph(text, {size=11,font=regular,gap=9,color=ink}={}) {
    const maxWidth=507;
    for(const segment of clean(text).split('\n')) {
      let line='';
      for(const word of segment.split(/\s+/).filter(Boolean)) {
        const next=line?`${line} ${word}`:word;
        if(line && font.widthOfTextAtSize(next,size)>maxWidth){draw(line);line='';}
        if(font.widthOfTextAtSize(word,size)>maxWidth){
          for(const character of word){if(font.widthOfTextAtSize(line+character,size)>maxWidth){draw(line);line='';}line+=character;}
        } else line=line?`${line} ${word}`:word;
      }
      if(line)draw(line);
    }
    y-=gap;
    function draw(text){if(y<85)newPage();page.drawText(text,{x:44,y,size,font,color});y-=size*1.45;}
  }
  newPage();
  paragraph('PROJECT ESTIMATE',{font:bold,size:17,color:teal,gap:16});
  if(quote.customer)paragraph(`Customer / project: ${quote.customer}`,{font:bold});
  if(quote.contact)paragraph(`Contact: ${quote.contact}`);
  if(quote.reference)paragraph(`Reference: ${quote.reference}`);
  for(const block of quote.blocks)paragraph(block,{font:block.startsWith('Estimated total')?bold:regular,size:block.startsWith('Estimated total')?15:11,gap:13});
  paragraph(quote.scope,{size:10,gap:12});
  const pages=pdf.getPages();
  pages.forEach((p,i)=>{
    p.drawLine({start:{x:44,y:62},end:{x:551,y:62},thickness:0.5,color:teal});
    p.drawRectangle({x:44,y:31,width:20,height:20,color:teal});
    p.drawText('W',{x:48,y:36,size:12,font:bold,color:rgb(1,1,1)});
    p.drawText('Powered by WebNest Studios',{x:72,y:43,size:9,font:regular,color:ink});
    p.drawText('juswrk.github.io/WebNestStudios/',{x:72,y:30,size:8,font:regular,color:ink});
    p.drawText(`${i+1} / ${pages.length}`,{x:520,y:36,size:9,font:regular,color:ink});
  });
  return pdf.save();
}
