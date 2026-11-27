# Juswrk Electrical Services

A static, white-and-teal installation selector with large service buttons, multiple shared cable-route sections, live price breakdowns, printable quotations and matching fuseboard adverts for 4–15 ways.

## Publish on GitHub Pages

Upload the contents of the ZIP to the root of the `ep-electrical-services` repository. In Settings → Pages choose main / (root). The intended GitHub Pages address is https://juswrk.github.io/ep-electrical-services/.

Use an HTTP server to preview locally. JavaScript modules require HTTP rather than opening index.html directly from the filesystem. No package installation or build is required.

## Pricing

Rates are in `data.js`, extracted from ElecTrix(2).ods. The 5-way price is £540, matching that matrix and the updated advert. Fitting quantities multiply fitting rates. Each route section's length multiplies its installation rate once. Cable count affects the reported cable quantity only. Travel is charged once. Cable materials are initially included in job pricing, as a visible test assumption. The optional separate materials field adds a flat agreed allowance. Additional testing, other work and VAT initially add zero and can be edited.

The sample project is five metal-finish sockets, 3 m trunking, 5 m floorboard routing and 7 m loft routing in Eastham. Its total is £510. New-position sockets use the matrix's per-fitting allowance plus the shared routing cost. Cable supply and CCTV are enquiry-only until rates are supplied. The selector records the work area and estimates price; it does not choose cable sizes or establish circuit suitability.

## Share and quote

Copy project link captures the complete estimate in the URL fragment and can be pasted into Facebook or messages. The recipient can edit it. Customer name and reference entered in the quotation are not included in that share link. Facebook uses the general brochure preview. Old #fuseboards/12 links also remain supported.

View quotation opens an itemised estimate with a print/save-PDF button. WebNest footer links on both views point to https://juswrk.github.io/WebNestStudios/.

The small hexagonal W is a provisional WebNest footer mark.

Service images are illustrative placeholders in assets/service-photos.jpg. Their positions are defined by servicePhotos in app.js. Customer route controls and quotations display a combined installation price without metre rates. Rates used for the calculation remain in data.js.
