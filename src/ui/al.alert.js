/*global al, f$ */

//al.ui.alert
(function(){
    var alerts = [], zIndex=1060;
    
    al.ui.alert = function(/* 
        (options) 
        (message) 
        (message, [buttons]) 
        (message, callback) 
        (message, [buttons], callback) */){
        
        var options, alert;
        
        if (f$.isObject(arguments[0])) {
            options=arguments[0];        
        }else{
            options = {
                message : arguments[0],
                buttons : f$.isArray(arguments[1]) ? arguments[1] : null,
                callback: f$.isFunction(arguments[1]) ? arguments[1] : f$.isFunction(arguments[2]) ? arguments[2] : null
            };
        }
        
        options.type = options.type || 'warning';
        options.effect = options.effect || 'fade';
        
        alert = getAlert();
        
        alert.__effect__ = options.effect;
        alert.__popup__.className   = 'alert alert-'+options.type;
        alert.__content__.innerHTML = options.message;
        
        alert.show(options.parent || document.body);
    };
    
    function getAlert(){
        var i, alert;
        
        for (i=0; i<alerts.length; i++){
            alert = alerts[i];
            if (alert.__visible__) return alert;
        }
        
        alert = document.createElement('div');                                                                       //alert,self
        alert.className = 'modal-dialog';
        alert.innerHTML   = '<div class="alert alert-danger" style="min-height:50px">'+              //__popup__
                                '<button type="button" class="close" onclick="this.parentNode.parentNode.close()">'+ //__close__
                                    '<span>×</span>'+
                                '</button>'+
                                '<div></div>'+                                                                       //__content__
                            '</div>';
                      
        alert.__backdrop  = document.createElement('div');
        alert.__popup__   = alert.firstChild;
        alert.__close__   = alert.firstChild.childNodes[0];
        alert.__content__ = alert.firstChild.childNodes[1];
        alert.__effect__  = 'fade';
        
        alert.close = function(){
            var self=this;
            
            //aplica effeito de ocutação
            self.__backdrop.className = 'modal-backdrop fade out';
            self.className = 'modal-dialog '+self.__effect__+' out';
            
            setTimeout(function(){
                self.__visible__ = false;
                self.__parent.removeChild(self.__backdrop);
                self.__parent.removeChild(self);
                self.__parent = null;
            },1000);
        };
        alert.show = function(parent){
            var self=this;
            
            self.style.zIndex = (zIndex++);
            self.style.display='block';
            self.__visible__ = true;
            
            //inicia o estado do div backdrop e do modal (pre efeito de exibição)
            self.className = 'modal-dialog '+self.__effect__;
            self.__backdrop.className = 'modal-backdrop fade';
            
            self.__parent = parent;
            
            parent.appendChild(self.__backdrop);
            parent.appendChild(this);
            
            setTimeout(function(){
                //muda as classes aplicando os efeitos de exibição
                self.className='modal-dialog '+self.__effect__+' in';
                self.__backdrop.className = 'modal-backdrop fade in';
            },1);
        };
        
        alerts.push(alert);
        
        return alert;
    }
    
}());
