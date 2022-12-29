$(document).ready(function() {
    $('#myTable').DataTable( {
        dom: 'Bfrtip',
        buttons: [
             'excel', 'pdf'
        ]
    } );
} );