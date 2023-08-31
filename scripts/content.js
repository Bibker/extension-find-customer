// ON SEARCH CLICK, INJECT AJAX CALL IN IRD's SITE and STORE VALUE IN GLOBAL VARIABLE i.e customerDetails AND SEND customerDetails to Background(SEE==>LINE 34)
$(document).off('input', '.company_pan').on('input', '.company_pan', function() {

    var pan = $(this).val();
    var pan_length = pan.length;
    if (pan_length == 9)
     {
    var script_tag = document.createElement('script');
    script_tag.type = 'text/javascript';
    holder = document.createTextNode(`
    
    var customerDetails='null';
    var pan=$(".supplier_pan").val();
    
            $.ajax({
                type: "POST",
                data: {'pan': pan},
                url: "https://vctsdri.dri.gov.np/common/login_api",
                
                success: function(response) {
                   if(response==0){
                    console.log("Error Occured");
                   }
                   console.log(response);
                   customerDetails=response;
                 }
                });
    
    
    `);
    
    script_tag.appendChild(holder);
    document.head.appendChild(script_tag);

    var counter = 1;

    var sendData = setInterval(function() {
        if (counter <= 50) {
            var windowVariables = retrieveWindowVariables(["customerDetails"]);
            console.log(windowVariables.customerDetails);
            // SENDING MESSAGE TO BACKGROUND
            chrome.runtime.sendMessage(windowVariables.customerDetails);
            counter++;
        } else {
            setTimeout(function() {
                clearInterval(sendData);
            }, 500)
        }


    }, 700)
}


});


//GETTING GLOBAL VARIABLE'S VALUE i.e(customerDetails i.e RESPONCE FROM OUR AJAX FROM IRD)
function retrieveWindowVariables(variables) {
    var ret = {};

    var scriptContent = "";
    for (var i = 0; i < variables.length; i++) {
        var currVariable = variables[i];
        scriptContent += "if (typeof " + currVariable + " !== 'undefined') $('body').attr('tmp_" + currVariable + "', JSON.stringify(" + currVariable + "));\n"
    }

    var script = document.createElement('script');
    script.id = 'tmpScript';
    script.appendChild(document.createTextNode(scriptContent));
    (document.body || document.head || document.documentElement).appendChild(script);

    for (var i = 0; i < variables.length; i++) {
        var currVariable = variables[i];
        ret[currVariable] = $.parseJSON($("body").attr("tmp_" + currVariable));
        $("body").removeAttr("tmp_" + currVariable);
    }

    $("#tmpScript").remove();

    return ret;
}


//SET CUSTOMER DETAILS IN OUR PAGE AFTER MESSAGE IS RECEIVED FROM BACKGROUND (and Background sends message on extension click==>SEE Background.js)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message != 'null' && message != '0') {
        console.log(message);
        let businessDetail = message.data.panDetails.Businesses[0];
        let customerDetail = message.data.panDetails;

        let fullName=customerDetail.NameEnglish;
        let contact=businessDetail.Address.Telephone;
        let panNumber=businessDetail.PAN;
        let panName=businessDetail.NameEnglish;
        let district=businessDetail.Address.DistrictNameEng;
        
        if (window.location.hash == '#customers') {
            $('#add_customer_pnumber').val(panNumber);
            $('#add_customer_pname').val(panName);
            $('#add_customer_fname').val(fullName);
            $('#add_customer_district').val(district);
            if (contact != null)
                $('#add_customer_mobile').val(contact.replace(',', ' ').trim());
            else
                $('#add_customer_mobile').val('');
        } else if (window.location.hash == "#sales") {

            $('#add_sales_fname').val(fullName);
            $('#add_sales_district').val(district);
            if (contact != null)
                $('#add_sales_mobile').val(contact.replace(',', ' ').trim());
        }

    } else {

        alert('कुनै कस्टोमर छैन\nIRD मा कस्टोमरको पान सरच गर्नुहोस');
        window.open('https://ird.gov.np/pan-search', '_blank');

    }


})