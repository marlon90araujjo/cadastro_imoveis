var pagina = $("#pagina").val();

$(document).ready(function(){

    $("#btn-novo").click(function(){
        $("#codigo_esp").val(0);
        $("#codigo_tpi").val(0);
        $("#tipo_esp").val(0);
        $('#form-modal-cadastro').formValidation('resetForm', true);
        $("#modal-cadastro").modal('show');
    });

    $('#form-modal-cadastro').formValidation({
            framework: 'bootstrap',
            excluded: [':disabled', ':hidden', ':not(:visible)'],
            icon: {
                valid: 'fa fa-check',
                invalid: 'fa fa-remove',
                validating: 'fa fa-trash-o'
            },
            fields: {
                descricao_esp: {
                    validators: {
                        notEmpty: {
                            message: 'campo obrigatório'
                        }
                    }
                }
            }
        }).on('success.form.fv', function(e) {
        e.preventDefault();

        var $form    = $(e.target),
            params   = $form.serializeArray(),
            formData = new FormData();

        $.each(params, function(i, val) {
            formData.append(val.name, val.value);
        });

        $.ajax({
            url: $form.attr('action'),
            type: 'POST',
            data: formData,
            dataType : 'json',
            cache: false,
            contentType: false,
            processData: false,
            success: function(data) {
                if(data.retorno){
                    buscar();
                    $("#modal-cadastro").modal('hide');
                    $('#form-modal-cadastro').formValidation('resetForm', true);
                    retorno_mensagem('Salvo');
                }else{
                    retorno_mensagem(data.mensagem, 'aviso');
                }
            },
            error: function(){
                $("#modal-cadastro").modal('hide');
                retorno_mensagem("Houve um erro com a conexão, tente novamente!", 'erro');
            }
        });
    })

});

$(document).on('click', '.btn-alterar', function(){
    mostrar_carregando();
    var codigo = $(this).data('codigo');
    $("#codigo_esp").val(codigo);
    buscar_registro(codigo);
});

$(document).on('click', '.btn-excluir', function(){
    var codigo = $(this).data('codigo');
    var nome = $(".col_nome_" + codigo).text();
    var texto = 'Você está prestes a excluir <b>' + nome + '</b>';

    swal({
            title: "Excluir?",
            text: texto,
            html: true,
            type: "info",
            showCancelButton: true,
            //confirmButtonColor: "#18a689",
            confirmButtonText: "Excluir",
            cancelButtonText: "Cancelar",
            closeOnConfirm: true,
            allowOutsideClick: true
        },
        function() {
            $.ajax({
                url: base_url + pagina + "/excluir",
                type: 'POST',
                data: {codigo: codigo},
                dataType : 'json',
                success: function(data) {

                    if(data.retorno){
                        buscar();
                        swal("Excluido!", "success");
                    }else{
                        retorno_mensagem("Houve algum erro!", 'Erro');
                    }
                },
                error: function(){
                    retorno_mensagem("Houve um erro com a conexão, tente novamente!", 'Erro');
                }
            });
        });
});

function buscar(data){
    mostrar_carregando();

    $.ajax({
        url: base_url + pagina + "/buscar",
        type: 'POST',
        data: data,
        dataType : 'json',
        success: function(data) {
            if(data.retorno){
                monta_tabela(data.dados);
            }else{
                $("#dados-tabela").html("<tr><td colspan='3' style='text-align: center'>Nenhum registro Encontrado!</td></tr>");
                monta_tabela();
                retorno_mensagem(data.mensagem, 'Aviso');
            }
            fechar_carregando();
        },
        error: function(){
            fechar_carregando();
            $("#txt-pesquisar").focus();
            retorno_mensagem("Houve um erro com a conexão, tente novamente!", 'Erro');
        }
    });
}

function buscar_registro(codigo){
    $.ajax({
        url: base_url + pagina + "/buscar_registro",
        type: 'POST',
        data: {codigo: codigo},
        dataType : 'json',
        success: function(data) {

            if(data.retorno){
                preenche_campos(data.dados);
                $("#modal-cadastro").modal('show');
            }else{
                retorno_mensagem(data.mensagem, 'Aviso');
            }
            fechar_carregando();
        },
        error: function(){
            fechar_carregando();
            retorno_mensagem("Houve um erro com a conexão, tente novamente!", 'Erro');
        }
    });
}

function monta_tabela(dados){
    var html = "<tr><td colspan='6' style='text-align: center'>Nenhum registro Encontrado!</td></tr>";
    var tipo = "";

    if(dados !== undefined) {
        var tam  = dados.length;

        if (tam > 0) {
            html = "";

            for (var i = 0; i < tam; i++) {
                var alterar = verificar_acao(pagina, "alterar") ? ' <button class="btn-alterar btn btn-success btn-acoes" data-toggle="tooltip" data-placement="top" title="Alterar" data-original-title="Alterar" data-codigo="' + dados[i].codigo_esp + '" style="padding: 5px;"><i class="mdi mdi-lead-pencil"></i></button>' : '';
                var excluir = verificar_acao(pagina, "excluir") ? ' <button class="btn-excluir btn btn-danger btn-acoes" data-toggle="tooltip" data-placement="top" title="Excluir" data-original-title="Excluir" data-codigo="' + dados[i].codigo_esp + '" style="padding: 5px;"><i class="mdi mdi-delete-forever"></i></button>' : '';

                var tipo = parseInt(dados[i].tipo_esp) === 0 ? "Sim/Não" : "Campo Livre";

                html += "<tr>" +
                            "<td>" + dados[i].descricao_tpi + "</td>" +
                            "<td class='col_nome_" + dados[i].codigo_esp + "'>" + dados[i].descricao_esp + "</td>" +
                            "<td>" + tipo + "</td>" +
                            "<td>" + alterar + excluir + "</td>" +
                        "</tr>";
            }
        }
    }
    $("#dados-tabela").html(html);
}

function preenche_campos(dados){
    $("#codigo_esp").val(dados[0].codigo_esp);
    $("#codigo_tpi").val(dados[0].codigo_tpi);
    $("#descricao_esp").val(dados[0].descricao_esp);
    $("#tipo_esp").val(dados[0].tipo_esp);
}