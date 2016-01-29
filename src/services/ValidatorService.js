/*global alight, moment, al, ENV */

/**
 * @author Fábio Nogueira
 * @version 1.0
 * @dependecies alight 0.10, jQuery 1.x
 * @service ValidatorService
 */

(function(){
    al.service('ValidatorService', function () {
        var validators = {};

        return {
            create: function(name, options){
                options.init = options.init || function(){};
                options.name = name;
                validators[name] = options;
                return this;
            },
            getValidator: function(name){
                return validators[name];
            },
            checkValue: function (value, fieldDefinition) {
                var result=[], validator, checker, r, i;
                
                fieldDefinition = fieldDefinition || {};
                validator = fieldDefinition.validator;
                
                for (i in validator){    
                    if ( (value==='' || value===null || value===undefined) && i!=='required'){
                        continue;
                    }
                    
                    checker = validators[i==='type'?validator[i]:i];
                    if (checker){
                        r = checker.check(value, validator);
                        if (r !== true){
                            result.push( messageCompiler(value, checker, fieldDefinition) );
                        }
                    }
                }
                
                return result;
            }
        };
        
        function messageCompiler(value, validator, fieldDefinition){
            var msg, mt, i;
            
            mt = 'message_' + fieldDefinition.type;
            msg= fieldDefinition['validatorMessage_'+validator.name] || fieldDefinition['validatorMessage_'+validator.name+'_'+fieldDefinition.type] || 
                 validator[mt] ||  validator.message;
            
            for (i in fieldDefinition){
                msg = msg.replace('{'+i+'}', fieldDefinition[i]);
            }
            
            //se não foi definido o label, substitui {label} pelo nome do campo
            msg = msg.replace('{label}', fieldDefinition.name);
            
            for (i in fieldDefinition.validator){
                msg = msg.replace('{'+i+'}', fieldDefinition.validator[i]);
            }
            
            return msg.replace('{value}', value);
        }
    });
    
    if (!ENV.validators) ENV.validators={};
    
    al.service('ValidatorService')
        .create('string', {
            message: ENV.validators.string_message || 'String data type error',
            check: function(fieldValue){
                return fieldValue===null || typeof (fieldValue) === 'string' ? true : false;
            },
            init: function(element, options){
                if (options.mask){
                    alight.directives.ng.mask.init(element, options.mask);
                }
            }
        })
        .create('integer', {
            message: ENV.validators.integer_message || 'Integer data type error',
            check: function(fieldValue){
                return !isNaN( Number(fieldValue) );
            }
        })
        .create('date', {
            message: ENV.validators.date_message || 'Data type error',
            check: function(fieldValue){
                return moment(fieldValue, ["DD/MM/YYYY"], true).isValid();
            },
            init: function(element, options){
                alight.directives.ui.datepicker.create(element);
                
                if (options.mask) {
                    alight.directives.ng.mask.init(element, options.mask);
                }
            }
        })
        .create('cpf', {
            message: '',
            check:function(cpf){
                var i, soma, resto;
                
                cpf = cpf.replace(/\.|\-|\s/g,'');
                soma = 0;
                
                if (cpf === "00000000000") return false;
                
                for (i=1; i<=9; i++) soma = soma + parseInt(cpf.substring(i-1, i)) * (11 - i);
                
                resto = (soma * 10) % 11;
                
                if ((resto === 10) || (resto === 11)) resto = 0;
                if (resto !== parseInt(cpf.substring(9, 10)) ) return false;
                
                soma = 0;
                
                for (i = 1; i <= 10; i++) soma = soma + parseInt(cpf.substring(i-1, i)) * (12 - i);
                resto = (soma * 10) % 11;
                if ((resto === 10) || (resto === 11)) resto = 0;
                if (resto !== parseInt(cpf.substring(10, 11) ) ) return false;
                
                return true;
            },
            init:function(element){
                alight.directives.ng.mask.init(element, '000.000.000-00');
            }
        })
        .create('required', {
            message: ENV.validators.required_message || 'Field is required',
            check: function(value){
                return !(value==='' || value===null || value===undefined);
            }
        })
        .create('email', {
            message: ENV.validators.email_message || 'Invalidate email',
            check: function(fieldValue, options){
                var PATTERN = /^[a-z0-9\u007F-\uffff!#$%&'*+\/=?^_`{|}~-]+(?:\.[a-z0-9\u007F-\uffff!#$%&'*+\/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/i;
                return PATTERN.exec(fieldValue) ? true : false;
            }
        })
        .create('max', {
            message: ENV.validators.max_message || 'The value {value} invalid, max value is {max}',
            message_string: ENV.validators.max_message_string || 'The maximum length is {max}',
            check: function(fieldValue, options){
                return (1*fieldValue) <= (1*options.max);
            }
        })
        .create('min', {
            message: ENV.validators.min_message || 'The value {value} invalid, min value is {min}',
            message_string: ENV.validators.min_message_string || 'The minimum length is {min}',
            check: function(fieldValue, options){
                var min = 1*options.min;
                
                if (options.type==='string'){
                    return (fieldValue.length) >= min;
                }else{
                    return (1*fieldValue) >= min;
                }
            }
        })
        .create('size', {
            init: function(element, options){
                element.maxLength = options.size;
            }
        });
    
}());

