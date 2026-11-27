# Juswrk Electrical Services

A static, white-and-teal installation selector with large service buttons, multiple shared cable-route sections, live price breakdowns, printable quotations and matching fuseboard adverts for 4–15 ways.

## Publish on GitHub Pages

Upload the contents of the ZIP to the root of the `ep-electrical-services` repository. In Settings → Pages choose main / (root). The intended GitHub Pages address is https://juswrk.github.io/ep-electrical-services/.

Use an HTTP server to preview locally. JavaScript modules require HTTP rather than opening index.html directly from the filesystem. No package installation or build is required.

## Pricing

Rates are in `data.js`, extracted from ElecTrix(2).ods. The 5-way price is £540, matching that matrix and the updated advert. Fitting quantities multiply fitting rates. Each route section's length multiplies its installation rate once. Cable count affects the reported cable quantity only. Travel is charged once. Cable materials are initially included in job pricing, as a visible test assumption. The optional separate materials field adds a flat agreed allowance. Additional testing, other work and VAT initially add zero and can be edited.

The starting example is one white socket-front replacement in Ellesmere Port, with no new cable route. Its total is £25. Replace existing appears first and is selected by default. New-position sockets use the matrix's per-fitting allowance plus the shared routing cost. Cable supply and CCTV are enquiry-only until rates are supplied. The selector records the work area and estimates price; it does not choose cable sizes or establish circuit suitability.

## Share and quote

Copy project link captures the complete estimate in the URL fragment and can be pasted into Facebook or messages. The recipient can edit it. Customer name and reference entered in the quotation are not included in that share link. Facebook uses the general brochure preview. Old #fuseboards/12 links also remain supported.

View quotation opens an itemised estimate with a print/save-PDF button. WebNest footer links on both views point to https://juswrk.github.io/WebNestStudios/.

The small hexagonal W is a provisional WebNest footer mark.

Service overview images are individual JPG files selected by servicePhotos in app.js. Route controls display a combined installation price without metre rates. Quotations list each route method as a percentage of the combined measured route, grouped by method and rounded to total 100%, as included work, with routing cost included in the overall project total. Rates used for the calculation remain in data.js.

Every fitting has its own JPG file, assets/item-02.jpg through assets/item-33.jpg. Product variants use shared illustrative photography initially, stored as independent files so each can be replaced individually. The product IDs and labels are in data.js. The service overview uses these same individual images. Cable supply and CCTV have separate JPG files.

Start over and the WebNest Studios link sit at the right-hand side of the logo header. Start over resets the entire project. A full-width splash photograph beneath the header reuses the Juswrk homepage project image with a teal overlay.

Branding uses the refreshed teal circuit-J Juswrk logo and “Getting you connected” tagline, without an establishment year.

The splash now uses the supplied montage of actual Juswrk installations. All fuseboard totals include an additional £20 per protected circuit for testing and certification.

Quotations have separate Save PDF and Print controls. Share PDF / Gmail uses the device share sheet when supported; otherwise it downloads the PDF and opens a draft addressed to 4siteonline@gmail.com. The user must attach the PDF and send the email. No email is sent automatically. PDF generation uses bundled pdf-lib (MIT) without a CDN.

Accept quotation requires a customer name and valid email address, then prepares an email to 4siteonline@gmail.com containing the selected work, total and share link. The customer is added in CC so both parties receive the acceptance message. PDF attachments must be added manually in Gmail. The customer must send the email; opening a draft is not recorded as an acceptance or booking.
