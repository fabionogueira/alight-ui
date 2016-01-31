var ENV = {
    validators:{
        string_message    : 'Texto inválido.',
        integer_message   : 'Número inválido',
        date_message      : 'Data inválida.',
        email_message     : 'Email inválido.',
        cpf_message       : 'CPF inválido',
        required_message  : 'O campo <b>{label}</b> deve ser preenchido.',
        max_message       : '<b>{label}</b> não pode ser maior que {max}.',
        max_message_string: '<b>{label}</b> deve ter no máximo {max} caracteres.',
        min_message       : '<b>{label}</b> não pode ser menor que {min}.',
        min_message_string: '<b>{label}</b> deve ter no pelo menos {min} caracteres.'
    },
    i18n:{
        dates:{
            days: ["Domingo", "Segunda", "Terça", "Quarta", "Qunta", "Sexta", "Sábado"],
            daysShort: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"],
            daysMin: ["Do", "Se", "Te", "Qa", "Qi", "Se", "Sá"],
            months: ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"],
            monthsShort: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"],
            today: "Hoje",
            clear: "Limpar",
            titleFormat: "MM yyyy",
            format: "dd/mm/yyyy"
        }
    }
};
