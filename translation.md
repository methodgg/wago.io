# Translating wago.io

Wago is now setup for internationalization! Interested in seeing it in your own language and want to volunteer some time? Read on.

There are currently about 500 strings total, most of these are short and only 1-2 words used for buttons or labels. About 150 of the terms are available on the Blizzard Battle.net API so for languages supported that will cut down on the work.

I'm using https://poeditor.com/ to organize and compile the translations so to start I'll need your email address to invite you to the project as a contributor. The interface is very good and you'll have no problem getting started.

There are two things that show up in the strings to translate that use some code to determine what it is.

1. A small number of strings use HTML such as &lt;strong&gt;bold words&lt;/strong&gt;. The HTML should stay as-is but the actual text should be translated. In layman's terms, don't touch anything between < and >.
1. Some strings include variables denoted like [-count-]. These are generally numbers or names, not something that would need to be translated itself. Keep these as-is and just move them so that they make sense.

The following is the status of supported and to-be-supported languages (as of this document's last update time). If you're still here and interested in helping out then give me a shout on the WeakAuras Discord.

| Language  	| Warcraft Terms  	| Complete  	| Contributor(s)  	|
|---	|---	|---	|---	|
| English  	| ✔️ Included 	    |  ✔️ 100%	|   Wago.io |
| French  	|  😞 Not included	|   93%  |   Satron	 |
| German  	| ✔️ Included 	    |  ✔️ 100%	|   Hamsda  |
| German  	| 😞 Not included	    |   1%	|   Ipse  |
| Italian  	| ✔️ Included 	    |  30%	| ❌ No one    |
| Korean  	| ✔️ Included 	    |  30%	| ❌ No one    |
| Portuguese  	| ✔️ Included 	    |  30%	| ❌ No one    |
| Russian  	| ✔️ Included 	    |   94%	|   Translit  |
| Simplified Chinese  	| ✔️ Included 	    | 100%	|    biggy0214  |
| Spanish  	| ✔️ Included 	    |  94%	|   Krich  |
| Swedish  	| 😞 Not included 	    |  21%	|   Hukk  |

Thanks for your time.

Ora
