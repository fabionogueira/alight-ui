/*global alight, al */

/**
 * @author Fábio Nogueira
 * @version 1.0
 * @dependecies alight 0.10, jQuery 1.x, jQuery Mask Plugin v1.13.4 [github.com/igorescobar/jQuery-Mask-Plugin]
 * @directive al-model
 */

(function(){
    var validatorService = al.service('ValidatorService');
    
    //ng-model
    alight.directives.al.model = function (element, name, scope) {
        var parts, model, modelName, dataModelName, field, self;
        
        if (!scope.$system.__modelErrorDirectiveElements){
            scope.$system.__modelErrorDirectiveElements = {};
        }
        
        if (element.type || element.nodeName==="SELECT" || element.nodeName === "TEXTAREA"){
            //<input type=radio>                      ::herança de al-radio
            if(element.type==='radio'){
                self = alight.directives.al.radio.init.apply(null, arguments);
            }
            //<input type=checkbox>                   ::herança de al-checked
            else if (element.type==='checkbox'){
                self = alight.directives.al.checked.init.apply(null, arguments);
            }
            //<input type=text>, <select>, <textarea> ::herança de al-value
            else{
                self = alight.directives.al.value.apply(null, arguments);
            }
            self.updateDom_ = self.updateDom;
            self.updateDom = function (value){
                self.fieldChanged(value);
                return self.updateDom_(value);
            };
        }
        
        self.fieldChanged = function(value, custom){
            var a;
            
            if (self.changing_) {
                self.changing_ = false;
                return;
            }
            
            scope[dataModelName][field] = value;
            
            a = validateModel(model, scope[dataModelName], function(fieldName, errors){
                if (fieldName===field){
                    setElementValidateStatus(element, scope, name, errors);
                }
            });
            
            scope[dataModelName]['$VALIDATE']  = a[0];
            scope[dataModelName]['$EDIT_MODE'] = a[1];
            
            setTimeout(function(){
                self.changing_ = true;
                scope.$scan(function(){
                    self.changing_ = false;
                });                
            },10);
        };
        
        $(element).on('customChange', function(){
            self.fieldChanged(this.value, true);
        });
        
        parts         = name.split('.');
        modelName     = parts[0].substring(1);
        field         = parts[1];
        model         = al.model(modelName, scope);
        dataModelName = '$'+modelName;
        
        if (model){
            initFieldValidator(model.fields[field], element);
        }
        
        return self;
    };
    
    function initFieldValidator(field, element){
        var validator;
        
        if (field){
            validator = validatorService.getValidator(field.type);
            if (validator) validator.init(element, field);
            if (field.size) validatorService.getValidator('size').init(element, field);
        }
    }
    function validateModel(model, dataModel, fn){
        var i, r, valid=true, mode='new';

        //valida os campos do model
        for (i in dataModel){

            if (model.fields[i]){
                r = validatorService.checkValue(dataModel[i], model.fields[i]);
                
                //se o campo é chave primária
                if (model.fields[i].key && dataModel[i]){
                    mode='edit';
                }
                
                if (r.length===0){
                    fn(i);
                }else{
                    valid=false;
                    fn(i, r);
                }
            }
        }

        return [valid, mode];
    }
    function setElementValidateStatus(element, scope, name, errors){
        var sys = scope.$system, elErr;
        
        if (sys.__modelErrorDirectiveElements){ 
            if (sys.__modelErrorDirectiveElements[name]){
                elErr = sys.__modelErrorDirectiveElements[name];
            }else{
                sys.__modelErrorDirectiveElements[name] = element;
            }
        }
        
        if (errors){
            element.setAttribute(alight.directives.al.modelError.ATTR_MODEL_ERROR, errors.join('|') );
            if (elErr){
                elErr.innerHTML = errors.join('|');
            }            
        }else{
            element.removeAttribute(alight.directives.al.modelError.ATTR_MODEL_ERROR);
            if (elErr){
                elErr.innerHTML = '';
            }
        }
    }
}());

