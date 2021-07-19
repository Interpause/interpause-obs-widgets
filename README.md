# interpause-obs-widgets

my personal browser-source based widgets for OBS streaming

Discovered this weirdly inconsistent behaviour in JS, at least chrome's V8 engine. const declared in a script normally are added to global scope, but when put into {} or declared within a function, are not visible. Nothing weird yet right? But get this, functions declared in {} are visible to the global scope, but are not visible when declared within a function. Finally, functions that are assigned to const follow the aforementioned behaviour for const. I find this troublingly inconsistent.

Yes, everything is javascript that pretty much self-injects itself. Heck, even most of the CSS is in the javascript. This is done by abusing JQuery as if it was React. I'm not sorry. The only CSS not in the javascript are the utility stuff like loading circles and rainbow backgrounds. Yes, I know utility CSS is supposed to be stuff like bootstrap or tailwind but I cannot be darned to add a full framework for what is only 10% usage of it in a exceptional edge case.
