# interpause-obs-widgets

my personal browser-source based widgets for OBS streaming

Discovered this weirdly inconsistent behaviour in JS, at least chrome's V8 engine. const declared in a script normally are added to global scope, but when put into {} or declared within a function, are not visible. Nothing weird yet right? But get this, functions declared in {} are visible to the global scope, but are not visible when declared within a function. Finally, functions that are assigned to const follow the aforementioned behaviour for const. I find this troublingly inconsistent.
