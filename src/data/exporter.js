
(function(){

    var Exporter = Graph.data.Exporter = function(vector, options){
        
        this.options = _.extend({}, Exporter.defaults, options || {});
        this.canvas = null;
        this.element = vector.node();
        
    };
    
    Exporter.defaults = {
        
    };

    Exporter.prototype.exportDataURI = function() {
        
    };
    
    Exporter.prototype.exportSVG = function() {
        
    };

    Exporter.prototype.exportJPEG = function() {
        exportImage('jpeg');
    };

    Exporter.prototype.exportPNG = function() {
        exportImage('png', this.element);
    };

    ///////// HELPERS /////////
    
    function exportImage(type, element) {
        var styles = getElementStyles(element);
        
        console.log(styles);
        
        createCanvas(function(canvas){
            console.log('loaded');
        });
    }

    function createCanvas(callback) {
        var canvas = document.createElement('canvas'),
            context = canvas.getContext('2d'),
            image = new Image();
        
        image.crossOrigin = 'anonymous';
        
        console.log(context);
    }
    
    function getElementStyles(element) {
        var result = '';
        var styles = document.styleSheets;
        var rules, rule, found, selector, selectorText, cssText;
        
        for (var i = 0, ii = styles.length; i < ii; i++) {
            
            rules = styles[i].cssRules;
            
            // try {
                // rules = styles[i].cssRules;
            // } catch(e) {
                // console.warn('Stylesheet could not be loaded: ' + sheets[i].href);
                // continue;
            // }
            
            
            if (rules != null) {
                for (var j = 0, jj = rules.length; j < jj; j++, found = null) {
                    
                    rule = rules[j];
                    
                    if (rule.style !== undefined) {
                        
                        selectorText = rule.selectorText;
                        
                        // try {
                            // selectorText = rule.selectorText;
                        // } catch(err) {
                            // console.warn('The following CSS rule has an invalid selector: "' + rule + '"', err);
                        // }
                        
                        if (selectorText) {
                            found = element.querySelector(selectorText);
                        }
                        
                        // try {
                            // if (selectorText) {
                                // found = element.querySelector(selectorText);
                            // }
                        // } catch(err) {
                            // console.warn('Invalid CSS selector "' + selectorText + '"', err);
                        // }
                        
                        if (found) {
                            // selector = selectorRemap ? selectorRemap(rule.selectorText) : rule.selectorText;
                            selector = rule.selectorText;
                            // cssText = modifyStyle ? modifyStyle(rule.style.cssText) : rule.style.cssText;
                            cssText = rule.style.cssText;
                            result += selector + " { " + cssText + " }\n";
                        } else if(rule.cssText.match(/^@font-face/)) {
                            // css += rule.cssText + '\n';
                            result += rule.cssText + '\n';
                        }
                    }
                }
            }
        }
        
        return result;
    }

}());