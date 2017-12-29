    $( document ).ready(function() {
        var selectedOntologies = [];

        var $select = $('#select-ontology').selectize({
        plugins: ['remove_button'],
        delimiter: ',',
        persist: false,
        onChange: function(value) {
               selectedOntologies = value;
        },
        create: function(input) {
        return {
            value: input,
            text: input
            }
        }
       });

       axios.defaults.headers.post['Content-Type'] = 'application/json; charset=utf-8';
       axios.defaults.headers.put['Content-Type'] = 'application/json; charset=utf-8';
       axios.defaults.headers.get['Content-Type'] = 'application/json; charset=utf-8';

       $("#searchClassForm").validate({
            rules: {
                searchTerm: "required"
            },
            messages: {
                searchTerm: "Please specify search term"
            }
        })

       $("#submit").on("click",function(event) {
            event.preventDefault();

            var isValid = $("#searchClassForm").valid();

            if (isValid) {
                var searchTerm = $("#searchTerms").val();
                var searchTerms = searchTerm.split(",");

                axios.post('/class/search', {
                    searchTerms: searchTerms,
                    ontologies: selectedOntologies
                }).then(function (response) {
                  if (response.data.length !== 0) {
                    $('#records_tables').empty()
                    response.data.forEach(function (searchTermResult, index) {
                        var trHTML = '<table class="table table-striped" style="margin-bottom: 60px;">' +
                                        '<thead>'+
                                            '<tr>' +
                                                '<th>PrefLabel</th>'+
                                                '<th>Obsolete</th>'+
                                                '<th>Ontology</th>'+
                                                '<th>Definition</th>'+
                                                '<th>SemanticType</th>'+
                                                '<th>Synonym</th>'+
                                            '</tr>'+
                                        '</thead>'+
                                        '<tbody>';

                        $.each(searchTermResult, function (key, value) {
                            trHTML +=
                            '<tr><td>' + value.prefLabel +
                            '</td><td>' + value.obsolete +
                            '</td><td><a href=' + value.ontology + ' target="_blank >' + value.ontology + '</a>' +
                            '</td><td>' + value.definition.join(", ") +
                            '</td><td>' + value.semanticType.join(", ") +
                            '</td><td>' + value.synonym.join(", ") +
                            '</td></tr>';
                        });

                        trHTML += '</tbody></table>';

                        $('#records_tables').append("<div id='records_table" + index + "'><h2>" + searchTerms[index] + "</h2>" + trHTML + "</div>");
                    })
                  }
                  else {
                    var trHTML = "No search results";
                    $('#records_tables').html(trHTML);
                  }
                })
                .catch(function (error) {
                    alert("Error while processing search request: " + error);
                })
            }
       })

       $("#ont_select_clear").on("click", function () {
            var selectize = $select[0].selectize;
            selectize.clear();
        });

    });