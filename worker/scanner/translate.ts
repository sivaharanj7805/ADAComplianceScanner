import type {
  AxeViolation,
  TranslatedViolation,
  ViolationTranslation,
} from './types';

// ============================================================================
// Plain-English violation translations
// ============================================================================

const VIOLATION_MAP: Record<string, ViolationTranslation> = {
  'color-contrast': {
    title: 'Text Color Too Hard to Read',
    severity: 'serious',
    impact:
      'People with low vision, color blindness, or aging eyesight may not be able to read this text. This affects roughly 1 in 12 men and 1 in 200 women.',
    description:
      'The text on this page does not have enough contrast against its background color. When text and background colors are too similar, the words become difficult or impossible to read for many people.',
    fix: 'Ask your designer or developer to increase the contrast ratio between the text color and background color. Normal-sized text needs a contrast ratio of at least 4.5:1, and large text (18px bold or 24px regular) needs at least 3:1. Free tools like the WebAIM Contrast Checker can test specific color combinations.',
    wcagCriteria: ['1.4.3 Contrast (Minimum)'],
  },
  'image-alt': {
    title: 'Image Missing Description',
    severity: 'critical',
    impact:
      'Screen reader users (people who are blind or have severe low vision) will not know what this image shows. If the image conveys important information, they will miss it entirely.',
    description:
      'This image has no text description (called "alt text"). When a screen reader encounters an image without alt text, it either skips it or reads the file name, which is usually meaningless (like "IMG_3847.jpg").',
    fix: 'Add an "alt" attribute to the image tag that briefly describes what the image shows. For example: alt="Company team photo at the 2024 holiday party". If the image is purely decorative (like a background pattern), set alt="" (empty) so screen readers skip it.',
    wcagCriteria: ['1.1.1 Non-text Content'],
  },
  'link-name': {
    title: 'Link Has No Descriptive Text',
    severity: 'serious',
    impact:
      'Screen reader users navigate pages by jumping between links. A link with no descriptive text is announced as just "link" — giving them no idea where it goes or what it does.',
    description:
      'This link does not have any text that describes its destination or purpose. It might be an image link with no alt text, an empty link, or a link that only says something generic like "click here".',
    fix: 'Give the link meaningful text that describes where it goes. Instead of "click here," write "View our pricing plans." If the link wraps an image, add alt text to the image. If the link has an icon but no visible text, add an aria-label attribute describing the link\'s purpose.',
    wcagCriteria: ['2.4.4 Link Purpose (In Context)', '4.1.2 Name, Role, Value'],
  },
  'button-name': {
    title: 'Button Has No Label',
    severity: 'critical',
    impact:
      'Screen reader users will encounter a button that provides no indication of what it does. They cannot safely interact with it because they do not know what will happen when they activate it.',
    description:
      'This button does not have a label describing what it does. It might be an icon-only button (like a hamburger menu or close button) without any text alternative.',
    fix: 'Add visible text inside the button, or add an aria-label attribute that describes the button\'s action. For example, a close button should have aria-label="Close" and a menu button should have aria-label="Open navigation menu".',
    wcagCriteria: ['4.1.2 Name, Role, Value'],
  },
  'label': {
    title: 'Form Field Missing Label',
    severity: 'critical',
    impact:
      'Screen reader users will not know what information to type into this form field. They will hear "edit text" or "text input" with no context about what the field is for (name, email, phone number, etc.).',
    description:
      'This form field (text box, dropdown, checkbox, etc.) does not have a label associated with it. Labels tell users what information the field expects.',
    fix: 'Add a <label> element linked to the form field using the "for" attribute that matches the field\'s "id". For example: <label for="email">Email Address</label> paired with <input id="email">. Alternatively, wrap the input inside the label tag.',
    wcagCriteria: ['1.3.1 Info and Relationships', '4.1.2 Name, Role, Value'],
  },
  'html-has-lang': {
    title: 'Page Language Not Specified',
    severity: 'serious',
    impact:
      'Screen readers use the page language to choose the correct pronunciation rules. Without it, a screen reader might try to read English text using French pronunciation rules (or vice versa), making the content incomprehensible.',
    description:
      'The page does not declare what language it is written in. This is set using the "lang" attribute on the <html> tag at the top of the page.',
    fix: 'Add a lang attribute to the <html> tag. For English pages, use: <html lang="en">. For Spanish, use lang="es". For French, use lang="fr". Your developer should be able to make this change in under a minute.',
    wcagCriteria: ['3.1.1 Language of Page'],
  },
  'document-title': {
    title: 'Page Has No Title',
    severity: 'serious',
    impact:
      'Screen readers announce the page title when a user first opens or navigates to a page. Without a title, users do not know what page they are on. It also affects browser tabs and bookmarks.',
    description:
      'The page is missing a <title> tag, or the title tag is empty. The title appears in the browser tab and is the first thing announced by screen readers.',
    fix: 'Add a descriptive <title> tag inside the <head> section of your page. The title should describe the page content — for example: <title>Contact Us - City of Springfield</title>. Each page on your site should have a unique, descriptive title.',
    wcagCriteria: ['2.4.2 Page Titled'],
  },
  'heading-order': {
    title: 'Heading Levels Skip Numbers',
    severity: 'moderate',
    impact:
      'Screen reader users rely on headings to understand page structure and navigate between sections. Skipping heading levels (going from H1 to H3) creates a confusing outline and makes it harder to navigate.',
    description:
      'Headings on this page jump levels — for example, going from an H1 directly to an H3, skipping H2. This is like a book outline that goes from "Chapter 1" to "Section 1.1.1" with nothing in between.',
    fix: 'Reorganize headings so they follow a logical sequence: H1 for the page title, H2 for major sections, H3 for subsections within those, and so on. Do not skip levels. Do not choose heading levels based on how they look — use CSS for styling instead.',
    wcagCriteria: ['1.3.1 Info and Relationships'],
  },
  'empty-heading': {
    title: 'Empty Heading Found',
    severity: 'moderate',
    impact:
      'Screen reader users navigating by headings will encounter a heading that announces nothing. This is confusing and wastes their time.',
    description:
      'There is a heading tag (H1, H2, H3, etc.) on this page that contains no text. This creates a gap in the page structure that confuses assistive technology.',
    fix: 'Either add meaningful text to the heading, or remove the empty heading tag entirely. If the heading was added for spacing purposes, remove it and use CSS margins or padding for spacing instead.',
    wcagCriteria: ['1.3.1 Info and Relationships', '2.4.6 Headings and Labels'],
  },
  'frame-title': {
    title: 'Embedded Content Missing Title',
    severity: 'serious',
    impact:
      'Screen reader users will not know what the embedded content is. They will hear "frame" with no description, and will not know whether it is a video, a map, a form, or something else.',
    description:
      'An iframe (embedded content like a video, map, or third-party widget) does not have a title describing what it contains.',
    fix: 'Add a title attribute to the iframe that describes its content. For example: <iframe title="Google Maps showing our office location" src="...">. The title should be specific enough that a user knows what the embedded content is without seeing it.',
    wcagCriteria: ['2.4.1 Bypass Blocks', '4.1.2 Name, Role, Value'],
  },
  'html-lang-valid': {
    title: 'Page Language Code Invalid',
    severity: 'serious',
    impact:
      'The page declares a language, but uses an invalid code. Screen readers will not be able to determine the correct pronunciation, which may cause content to be read incorrectly.',
    description:
      'The lang attribute on the <html> tag uses an invalid language code. Valid codes follow the BCP 47 standard (e.g., "en" for English, "es" for Spanish, "fr" for French).',
    fix: 'Correct the lang attribute to use a valid BCP 47 language code. Common codes: "en" (English), "es" (Spanish), "fr" (French), "de" (German), "zh" (Chinese), "ja" (Japanese). Your developer can look up the correct code at the IANA Language Subtag Registry.',
    wcagCriteria: ['3.1.1 Language of Page'],
  },
  'meta-viewport': {
    title: 'Page Blocks Zooming',
    severity: 'critical',
    impact:
      'People with low vision who need to zoom in to read text are prevented from doing so. This makes the page effectively unusable for anyone who needs magnification.',
    description:
      'The page uses a viewport meta tag that prevents users from zooming in (pinching to zoom on mobile), usually by setting maximum-scale=1 or user-scalable=no.',
    fix: 'Remove the "maximum-scale=1" and "user-scalable=no" settings from the viewport meta tag. The tag should look like: <meta name="viewport" content="width=device-width, initial-scale=1">. Never restrict the user\'s ability to zoom.',
    wcagCriteria: ['1.4.4 Resize Text'],
  },
  'list': {
    title: 'List Structure Incorrect',
    severity: 'moderate',
    impact:
      'Screen readers announce lists and their item count (e.g., "list of 5 items"), helping users understand the content structure. Improperly structured lists break this functionality.',
    description:
      'A list on this page is not structured properly. List items (<li>) must be directly inside a list container (<ul> for bullet lists or <ol> for numbered lists).',
    fix: 'Wrap list items inside the correct list container. For an unordered (bulleted) list, use <ul><li>Item</li></ul>. For an ordered (numbered) list, use <ol><li>Item</li></ol>. Do not place non-list elements directly inside <ul> or <ol>.',
    wcagCriteria: ['1.3.1 Info and Relationships'],
  },
  'listitem': {
    title: 'List Item Outside List',
    severity: 'moderate',
    impact:
      'Screen readers will not recognize this content as part of a list, which removes helpful context about how the information is organized.',
    description:
      'A list item (<li>) exists outside of a proper list container (<ul> or <ol>). List items must always be nested inside a list element.',
    fix: 'Wrap the stray <li> element inside a <ul> (for bullet lists) or <ol> (for numbered lists). If the content is not actually a list, remove the <li> tag and use a different element like <p> or <div>.',
    wcagCriteria: ['1.3.1 Info and Relationships'],
  },
  'input-image-alt': {
    title: 'Image Button Missing Label',
    severity: 'critical',
    impact:
      'Screen reader users will not know what this image button does. It will be announced as "button" with no indication of its purpose.',
    description:
      'An image used as a form submit button (<input type="image">) does not have alt text describing the button\'s action.',
    fix: 'Add an alt attribute to the image input that describes what the button does. For example: <input type="image" alt="Submit search" src="search-icon.png">. The alt text should describe the action, not the image.',
    wcagCriteria: ['1.1.1 Non-text Content', '4.1.2 Name, Role, Value'],
  },
  'select-name': {
    title: 'Dropdown Missing Label',
    severity: 'critical',
    impact:
      'Screen reader users will encounter a dropdown menu with no context about what they are supposed to select. They will hear "combo box" with no indication of its purpose.',
    description:
      'A dropdown (select) element does not have a label describing what selection the user should make.',
    fix: 'Add a <label> element linked to the dropdown. For example: <label for="state">State</label> <select id="state">...</select>. If a visible label is not desired, use aria-label on the select element: <select aria-label="Choose your state">.',
    wcagCriteria: ['1.3.1 Info and Relationships', '4.1.2 Name, Role, Value'],
  },
  'td-headers-attr': {
    title: 'Table Cell Missing Header Link',
    severity: 'moderate',
    impact:
      'Screen reader users navigating a data table will not be able to tell which column or row a cell belongs to, making the data impossible to understand.',
    description:
      'A table cell uses a "headers" attribute that points to an ID that does not exist, or the headers attribute is incorrectly configured.',
    fix: 'Ensure every table cell\'s "headers" attribute references the correct "id" of its corresponding header cell (<th>). For simple tables, using <th> elements in the first row and/or column is often sufficient without needing explicit headers attributes.',
    wcagCriteria: ['1.3.1 Info and Relationships'],
  },
  'th-has-data-cells': {
    title: 'Table Header Has No Data',
    severity: 'moderate',
    impact:
      'A table header exists that does not correspond to any data cells, which confuses screen readers trying to describe the table structure.',
    description:
      'A table header (<th>) does not have any data cells associated with it. This suggests the table structure may be incorrect.',
    fix: 'Review the table structure. Every <th> (table header) should have corresponding <td> (table data) cells in its column or row. If the header is not needed, remove it. If cells are missing, add the appropriate data cells.',
    wcagCriteria: ['1.3.1 Info and Relationships'],
  },
  'valid-lang': {
    title: 'Invalid Language Attribute',
    severity: 'moderate',
    impact:
      'An element on the page declares a language using an invalid code, which may cause screen readers to switch to incorrect pronunciation rules for that section.',
    description:
      'An element on this page has a "lang" attribute with an invalid language code. This is different from the page-level language — this applies to a specific section of content.',
    fix: 'Correct the lang attribute on the element to use a valid BCP 47 language code. For example: <p lang="es">Hola mundo</p> for Spanish text within an English page. Remove the lang attribute entirely if the content is in the same language as the rest of the page.',
    wcagCriteria: ['3.1.2 Language of Parts'],
  },
  'aria-allowed-attr': {
    title: 'Incorrect ARIA Attribute',
    severity: 'serious',
    impact:
      'Screen readers may misinterpret this element because it uses an ARIA attribute that is not valid for its role. This can cause confusing or incorrect announcements.',
    description:
      'An element uses an ARIA attribute that is not permitted for its type (role). ARIA attributes must match the element\'s role to work correctly.',
    fix: 'Remove the invalid ARIA attribute from this element, or change the element\'s role to one that supports the attribute. A developer can check the WAI-ARIA specification to see which attributes are allowed for each role.',
    wcagCriteria: ['4.1.2 Name, Role, Value'],
  },
  'aria-hidden-body': {
    title: 'Entire Page Hidden from Screen Readers',
    severity: 'critical',
    impact:
      'The entire page is invisible to screen reader users. They will perceive the page as completely blank and will not be able to access any content or functionality.',
    description:
      'The <body> element has aria-hidden="true", which tells screen readers to ignore the entire page. This makes the website completely inaccessible to anyone using a screen reader.',
    fix: 'Remove aria-hidden="true" from the <body> element immediately. This attribute should only be used on individual elements (like a background overlay behind a modal), never on the body. This is likely a bug introduced by a JavaScript modal/dialog library.',
    wcagCriteria: ['4.1.2 Name, Role, Value'],
  },
  'aria-required-attr': {
    title: 'ARIA Element Missing Required Attribute',
    severity: 'critical',
    impact:
      'Screen readers cannot properly convey this element\'s purpose or state because a required ARIA attribute is missing. Users may not be able to interact with it correctly.',
    description:
      'An element with an ARIA role is missing one or more attributes that are required for that role to function. For example, a slider (role="slider") requires aria-valuenow, aria-valuemin, and aria-valuemax.',
    fix: 'Add the missing required ARIA attributes. For example, if the element has role="checkbox", it needs aria-checked="true" or aria-checked="false". A developer can consult the WAI-ARIA specification for the complete list of required attributes for each role.',
    wcagCriteria: ['4.1.2 Name, Role, Value'],
  },
  'aria-required-children': {
    title: 'ARIA Element Missing Required Children',
    severity: 'critical',
    impact:
      'Screen readers expect certain child elements within ARIA roles. Missing children cause the element to malfunction, potentially hiding content or breaking navigation for screen reader users.',
    description:
      'An element with an ARIA role is missing required child elements. For example, a list (role="list") must contain list items (role="listitem"), and a menu (role="menu") must contain menu items.',
    fix: 'Add the required child elements with the correct ARIA roles. For example, if you have a role="tablist", it must contain elements with role="tab". Your developer should check the WAI-ARIA specification for the required children of the role being used.',
    wcagCriteria: ['4.1.2 Name, Role, Value'],
  },
  'aria-required-parent': {
    title: 'ARIA Element Missing Required Parent',
    severity: 'critical',
    impact:
      'This element will not function correctly for screen reader users because it exists outside of its required parent container. It may be ignored or misinterpreted.',
    description:
      'An element with an ARIA role exists outside of its required parent element. For example, a tab (role="tab") must be inside a tablist (role="tablist"), and a listitem must be inside a list.',
    fix: 'Wrap this element inside the correct parent element with the appropriate ARIA role. For example, elements with role="tab" must be inside an element with role="tablist". Your developer should consult the WAI-ARIA specification for required parent roles.',
    wcagCriteria: ['4.1.2 Name, Role, Value'],
  },
  'aria-roles': {
    title: 'Invalid ARIA Role',
    severity: 'critical',
    impact:
      'Screen readers will not understand what this element is because it uses an ARIA role that does not exist. The element may be completely ignored or incorrectly announced.',
    description:
      'An element uses an ARIA role value that is not a valid WAI-ARIA role. This is likely a typo or an outdated/made-up role name.',
    fix: 'Correct the role attribute to use a valid WAI-ARIA role. Common roles include: "button", "link", "navigation", "main", "dialog", "tab", "tabpanel", "alert", "menu", "menuitem". Remove the role attribute if the element does not need one — native HTML elements already have implicit roles.',
    wcagCriteria: ['4.1.2 Name, Role, Value'],
  },
  'aria-valid-attr-value': {
    title: 'ARIA Attribute Has Invalid Value',
    severity: 'serious',
    impact:
      'Screen readers may misinterpret this element because an ARIA attribute contains a value that is not valid. This can lead to incorrect or confusing announcements.',
    description:
      'An ARIA attribute on this element has a value that does not conform to what is expected. For example, aria-hidden should be "true" or "false", not "yes" or "no".',
    fix: 'Correct the ARIA attribute value. Boolean attributes (like aria-hidden, aria-expanded, aria-checked) accept "true" or "false". ID-reference attributes (like aria-labelledby, aria-describedby) must reference existing element IDs on the page. Your developer should check the WAI-ARIA specification for valid values.',
    wcagCriteria: ['4.1.2 Name, Role, Value'],
  },
  'aria-valid-attr': {
    title: 'Invalid ARIA Attribute Name',
    severity: 'serious',
    impact:
      'Screen readers will ignore this unrecognized ARIA attribute, which may mean important accessibility information is lost.',
    description:
      'An element uses an ARIA attribute name that does not exist in the WAI-ARIA specification. This is likely a typo (e.g., "aria-lable" instead of "aria-label").',
    fix: 'Correct the ARIA attribute name to a valid one. Common attributes include: aria-label, aria-labelledby, aria-describedby, aria-hidden, aria-expanded, aria-selected, aria-checked, aria-disabled, aria-required. Check for typos carefully.',
    wcagCriteria: ['4.1.2 Name, Role, Value'],
  },
  'duplicate-id': {
    title: 'Duplicate Element IDs Found',
    severity: 'moderate',
    impact:
      'When multiple elements share the same ID, form labels, ARIA references, and skip links may point to the wrong element. This can cause screen readers to announce incorrect information.',
    description:
      'Two or more elements on this page share the same ID attribute. IDs must be unique — each ID should appear only once on a page. Duplicate IDs break how assistive technology links labels to form fields and how ARIA references connect elements.',
    fix: 'Make each ID unique across the entire page. If elements were duplicated by a template or loop, add a unique suffix (like "email-1", "email-2"). Check form labels, ARIA attributes (aria-labelledby, aria-describedby), and skip-navigation links to ensure they reference the correct unique ID.',
    wcagCriteria: ['4.1.1 Parsing'],
  },
  'bypass': {
    title: 'No Skip Navigation Link',
    severity: 'serious',
    impact:
      'Keyboard-only users and screen reader users must tab through the entire navigation menu on every single page before reaching the main content. On pages with large menus, this can mean pressing Tab dozens of times.',
    description:
      'The page has no way to skip past the navigation to the main content. A "skip navigation" link (usually the first focusable element on the page) allows users to jump straight to the content.',
    fix: 'Add a "Skip to main content" link as the very first element in the page body. It should link to the main content area using an anchor: <a href="#main-content" class="skip-link">Skip to main content</a>. Then add id="main-content" to your main content container. The skip link can be visually hidden until focused.',
    wcagCriteria: ['2.4.1 Bypass Blocks'],
  },
  'region': {
    title: 'Content Not Inside Landmark Region',
    severity: 'moderate',
    impact:
      'Screen reader users navigate pages using landmark regions (header, navigation, main content, footer). Content outside of landmarks is harder to find and may be overlooked.',
    description:
      'Some content on this page is not contained within a landmark region. Landmarks (like <header>, <nav>, <main>, <footer>) help screen reader users understand the layout and jump to different sections.',
    fix: 'Wrap all page content in appropriate landmark elements. Use <header> for the site header, <nav> for navigation menus, <main> for the primary content, <aside> for sidebars, and <footer> for the footer. Every visible element on the page should be inside one of these landmarks.',
    wcagCriteria: ['1.3.1 Info and Relationships'],
  },
  'autocomplete-valid': {
    title: 'Incorrect Autocomplete Attribute',
    severity: 'moderate',
    impact:
      'Users who rely on browser autofill (including people with motor disabilities or cognitive disabilities) may get incorrect suggestions or no suggestions at all.',
    description:
      'A form field has an autocomplete attribute with an invalid or inappropriate value. Autocomplete helps browsers and password managers fill in forms automatically.',
    fix: 'Use the correct autocomplete value for each field type. Common values: "name" for full name, "email" for email, "tel" for phone, "street-address" for address, "postal-code" for ZIP code, "cc-number" for credit card. Remove autocomplete if the field does not correspond to a standard value.',
    wcagCriteria: ['1.3.5 Identify Input Purpose'],
  },
  'link-in-text-block': {
    title: 'Link Not Distinguishable from Text',
    severity: 'serious',
    impact:
      'People with color blindness cannot tell which text is a link and which is not. If the only visual indicator is color, they will miss the link entirely.',
    description:
      'A link within a block of text is only distinguished from surrounding text by color alone. There is no underline, bold, or other non-color visual indicator.',
    fix: 'Add an underline to links within text blocks, or provide another non-color visual indicator (like bold weight or an icon). The safest approach is to keep the default browser underline on links. If removing underlines for design reasons, add them back on hover and focus at minimum.',
    wcagCriteria: ['1.4.1 Use of Color'],
  },
  'tabindex': {
    title: 'Element Has Incorrect Tab Order',
    severity: 'serious',
    impact:
      'Keyboard users will encounter a confusing or illogical tab order, making it difficult to navigate the page and find interactive elements.',
    description:
      'An element has a tabindex value greater than 0, which forces it into a specific tab order position. This almost always creates a confusing navigation experience for keyboard users.',
    fix: 'Remove positive tabindex values (tabindex="1", tabindex="2", etc.) and rely on the natural DOM order for tab navigation. Use tabindex="0" to make non-interactive elements focusable, and tabindex="-1" to make elements programmatically focusable but not in the tab order. Rearrange elements in the HTML source to achieve the desired tab order.',
    wcagCriteria: ['2.4.3 Focus Order'],
  },
  'focus-order-semantics': {
    title: 'Focusable Element Has No Semantic Role',
    severity: 'moderate',
    impact:
      'Keyboard and screen reader users may encounter focusable elements that are not announced with a meaningful role, causing confusion about what the element is.',
    description:
      'An element that can receive keyboard focus does not have an appropriate semantic role, making it unclear what the element represents or does.',
    fix: 'Use native HTML elements that have built-in semantic roles (like <button>, <a>, <input>) instead of generic elements like <div> or <span> with tabindex. If a generic element must be used, add an appropriate ARIA role.',
    wcagCriteria: ['4.1.2 Name, Role, Value'],
  },
  'landmark-one-main': {
    title: 'Page Missing Main Landmark',
    severity: 'moderate',
    impact:
      'Screen reader users have no way to jump directly to the main content of the page. They must navigate through all surrounding content to find it.',
    description:
      'The page does not have a <main> element or an element with role="main". This landmark tells assistive technology where the primary content begins.',
    fix: 'Wrap the primary content of the page in a <main> element. There should be exactly one <main> element per page, and it should contain the content unique to that page (not headers, footers, or navigation).',
    wcagCriteria: ['1.3.1 Info and Relationships'],
  },
  'page-has-heading-one': {
    title: 'Page Missing Main Heading',
    severity: 'moderate',
    impact:
      'Screen reader users often navigate to the H1 heading first to understand what the page is about. Without one, they have less context about the page content.',
    description:
      'The page does not have a level-one heading (H1). Every page should have exactly one H1 that describes the page content or purpose.',
    fix: 'Add one H1 heading near the top of the main content area that clearly describes the purpose of the page. For example: <h1>Contact Us</h1> or <h1>Product Details</h1>. Use only one H1 per page.',
    wcagCriteria: ['1.3.1 Info and Relationships'],
  },
  'image-redundant-alt': {
    title: 'Image Description Repeats Surrounding Text',
    severity: 'minor',
    impact:
      'Screen reader users will hear the same information twice — once from the image description and once from the surrounding text — which is redundant and wastes their time.',
    description:
      'An image\'s alt text duplicates text that already appears adjacent to the image, such as a caption or heading.',
    fix: 'Either change the alt text to provide different information than the surrounding text, or set alt="" (empty) if the image is adequately described by its context. The goal is to avoid repeating the same information.',
    wcagCriteria: ['1.1.1 Non-text Content'],
  },
  'meta-refresh': {
    title: 'Page Refreshes Automatically',
    severity: 'critical',
    impact:
      'Automatic page refreshes disorient users, especially those with cognitive disabilities or screen reader users who lose their place on the page.',
    description:
      'The page uses a meta refresh tag to automatically reload or redirect after a set time period. This can disrupt users who need more time to read content.',
    fix: 'Remove the <meta http-equiv="refresh"> tag. If a redirect is needed, use a server-side redirect (HTTP 301/302) instead. If content needs to update, use JavaScript to update just the changed content without reloading the entire page.',
    wcagCriteria: ['2.2.1 Timing Adjustable', '3.2.5 Change on Request'],
  },
  'video-caption': {
    title: 'Video Missing Captions',
    severity: 'critical',
    impact:
      'Deaf and hard-of-hearing users cannot access the audio content of the video. Captions are also essential in noisy environments or when sound must be muted.',
    description:
      'A video element does not have captions (subtitles) provided. Captions must include all spoken dialogue and relevant sound effects.',
    fix: 'Add captions to the video using a <track> element with kind="captions". For example: <track kind="captions" src="captions.vtt" srclang="en" label="English">. Captions should include all dialogue, speaker identification, and relevant sound effects. Auto-generated captions should be reviewed and corrected for accuracy.',
    wcagCriteria: ['1.2.2 Captions (Prerecorded)'],
  },
  'definition-list': {
    title: 'Definition List Structure Incorrect',
    severity: 'moderate',
    impact:
      'Screen readers will not correctly announce the terms and definitions, making glossaries, FAQs, and similar content structures harder to navigate.',
    description:
      'A definition list (<dl>) contains elements other than <dt> (term) and <dd> (definition) as direct children, or is structured incorrectly.',
    fix: 'Ensure the <dl> element only contains <dt> and <dd> elements as direct children. Each term (<dt>) should be followed by one or more definitions (<dd>). If wrapping is needed, use <div> elements that each contain a <dt>/<dd> pair.',
    wcagCriteria: ['1.3.1 Info and Relationships'],
  },
  'dlitem': {
    title: 'Definition List Item Outside List',
    severity: 'moderate',
    impact:
      'Screen readers will not associate this term or definition with a definition list, losing the semantic connection between terms and their definitions.',
    description:
      'A <dt> (definition term) or <dd> (definition description) element exists outside of a <dl> (definition list) container.',
    fix: 'Wrap <dt> and <dd> elements inside a <dl> container. The correct structure is: <dl><dt>Term</dt><dd>Definition</dd></dl>.',
    wcagCriteria: ['1.3.1 Info and Relationships'],
  },
  'scope-attr-valid': {
    title: 'Table Header Scope Invalid',
    severity: 'moderate',
    impact:
      'Screen readers may not correctly associate table headers with their data cells, making it difficult for users to understand which data belongs to which category.',
    description:
      'A table header (<th>) uses a "scope" attribute with an invalid value. Valid values are "row", "col", "rowgroup", and "colgroup".',
    fix: 'Correct the scope attribute to use one of the valid values: scope="col" for column headers, scope="row" for row headers, scope="colgroup" for headers spanning multiple columns, scope="rowgroup" for headers spanning multiple rows.',
    wcagCriteria: ['1.3.1 Info and Relationships'],
  },
  'nested-interactive': {
    title: 'Interactive Elements Are Nested',
    severity: 'critical',
    impact:
      'Screen readers and keyboard users may not be able to access the inner interactive element, or may trigger the wrong action because interactive elements should not be placed inside other interactive elements.',
    description:
      'An interactive element (like a button or link) is nested inside another interactive element. For example, a button inside a link, or a link inside a button.',
    fix: 'Restructure the HTML so interactive elements are not nested. If a card needs to be clickable and also contain a button, make the card a link and place the button outside of it, or use JavaScript event handling to separate the interactions.',
    wcagCriteria: ['4.1.2 Name, Role, Value'],
  },
};

// ============================================================================
// WCAG tag to human-readable criteria mapping
// ============================================================================

const WCAG_TAG_MAP: Record<string, string> = {
  'wcag111': '1.1.1 Non-text Content',
  'wcag121': '1.2.1 Audio-only and Video-only',
  'wcag122': '1.2.2 Captions (Prerecorded)',
  'wcag123': '1.2.3 Audio Description or Media Alternative',
  'wcag124': '1.2.4 Captions (Live)',
  'wcag125': '1.2.5 Audio Description (Prerecorded)',
  'wcag131': '1.3.1 Info and Relationships',
  'wcag132': '1.3.2 Meaningful Sequence',
  'wcag133': '1.3.3 Sensory Characteristics',
  'wcag134': '1.3.4 Orientation',
  'wcag135': '1.3.5 Identify Input Purpose',
  'wcag141': '1.4.1 Use of Color',
  'wcag142': '1.4.2 Audio Control',
  'wcag143': '1.4.3 Contrast (Minimum)',
  'wcag144': '1.4.4 Resize Text',
  'wcag145': '1.4.5 Images of Text',
  'wcag1410': '1.4.10 Reflow',
  'wcag1411': '1.4.11 Non-text Contrast',
  'wcag1412': '1.4.12 Text Spacing',
  'wcag1413': '1.4.13 Content on Hover or Focus',
  'wcag211': '2.1.1 Keyboard',
  'wcag212': '2.1.2 No Keyboard Trap',
  'wcag214': '2.1.4 Character Key Shortcuts',
  'wcag221': '2.2.1 Timing Adjustable',
  'wcag222': '2.2.2 Pause, Stop, Hide',
  'wcag231': '2.3.1 Three Flashes or Below Threshold',
  'wcag241': '2.4.1 Bypass Blocks',
  'wcag242': '2.4.2 Page Titled',
  'wcag243': '2.4.3 Focus Order',
  'wcag244': '2.4.4 Link Purpose (In Context)',
  'wcag245': '2.4.5 Multiple Ways',
  'wcag246': '2.4.6 Headings and Labels',
  'wcag247': '2.4.7 Focus Visible',
  'wcag251': '2.5.1 Pointer Gestures',
  'wcag252': '2.5.2 Pointer Cancellation',
  'wcag253': '2.5.3 Label in Name',
  'wcag254': '2.5.4 Motion Actuation',
  'wcag311': '3.1.1 Language of Page',
  'wcag312': '3.1.2 Language of Parts',
  'wcag321': '3.2.1 On Focus',
  'wcag322': '3.2.2 On Input',
  'wcag323': '3.2.3 Consistent Navigation',
  'wcag324': '3.2.4 Consistent Identification',
  'wcag325': '3.2.5 Change on Request',
  'wcag331': '3.3.1 Error Identification',
  'wcag332': '3.3.2 Labels or Instructions',
  'wcag333': '3.3.3 Error Suggestion',
  'wcag334': '3.3.4 Error Prevention (Legal, Financial, Data)',
  'wcag411': '4.1.1 Parsing',
  'wcag412': '4.1.2 Name, Role, Value',
  'wcag413': '4.1.3 Status Messages',
};

function extractWcagCriteria(tags: string[]): string[] {
  const criteria: string[] = [];
  for (const tag of tags) {
    const mapped = WCAG_TAG_MAP[tag];
    if (mapped) {
      criteria.push(mapped);
    }
  }
  return criteria;
}

function mapSeverity(impact: string | null): 'critical' | 'serious' | 'moderate' | 'minor' {
  switch (impact) {
    case 'critical':
      return 'critical';
    case 'serious':
      return 'serious';
    case 'moderate':
      return 'moderate';
    case 'minor':
      return 'minor';
    default:
      return 'moderate';
  }
}

function generateFallbackTranslation(violation: AxeViolation): ViolationTranslation {
  const titleFromId = violation.id
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  const description = violation.help || violation.description || `An accessibility issue was found: ${titleFromId}.`;

  return {
    title: titleFromId,
    severity: mapSeverity(violation.impact),
    impact:
      'People using assistive technologies like screen readers may have difficulty with this part of the page.',
    description,
    fix: `This issue needs to be addressed to meet accessibility standards. ${violation.helpUrl ? 'Your developer can learn more at: ' + violation.helpUrl : 'Consult the WCAG 2.1 AA guidelines for more information.'}`,
    wcagCriteria: extractWcagCriteria(violation.tags),
  };
}

export function translateViolation(axeViolation: AxeViolation): TranslatedViolation {
  const known = VIOLATION_MAP[axeViolation.id];
  const translation = known ?? generateFallbackTranslation(axeViolation);

  const htmlSnippets: string[] = [];
  const cssSelectors: string[] = [];
  for (const node of axeViolation.nodes) {
    if (node.html) {
      htmlSnippets.push(node.html);
    }
    if (node.target && node.target.length > 0) {
      cssSelectors.push(node.target.join(' '));
    }
  }

  const wcagCriteria =
    translation.wcagCriteria.length > 0
      ? translation.wcagCriteria
      : extractWcagCriteria(axeViolation.tags);

  const severity = known ? translation.severity : mapSeverity(axeViolation.impact);

  return {
    ruleId: axeViolation.id,
    title: translation.title,
    severity,
    description: translation.description,
    impact: translation.impact,
    fix: translation.fix,
    wcagCriteria,
    htmlSnippets,
    cssSelectors,
    instanceCount: axeViolation.nodes.length,
  };
}

export function translateAllViolations(axeViolations: AxeViolation[]): TranslatedViolation[] {
  const severityOrder: Record<string, number> = {
    critical: 0,
    serious: 1,
    moderate: 2,
    minor: 3,
  };

  return axeViolations
    .map(translateViolation)
    .sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
}
