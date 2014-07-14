var chat = {
        messageId : 0,
        addMessage : function (content) {
            $("#chat").append("<div class=\"chat-message\" id=\"chat_message" + messageId + "\"></div>");
            $("#chat #chat_message" + messageId + "").html(content);
            messageId++;
            this.checkVisibility();
            $('#chat').scrollTop($('#chat')[0].scrollHeight);
        },
        deleteMessage : function (id) {
            $("#chat #chat_message" + messageId + "").remove();
        },
        sendMessage : function () {
            var value = $("#chat_new_message").val();
            $("#chat_new_message").val("");
            server.chatSend(value);
        },
        checkVisibility : function() {
            if ($("#chat_check_private input").is(':checked')) {
                $("#chat .private-message").show();
            } else {
                $("#chat .private-message").hide();
            }
            if ($("#chat_check_public input").is(':checked')) {
                $("#chat .public-message").show();
            } else {
                $("#chat .public-message").hide();
            }
        },
        init : function () {
            $("#chat_new_message").focusin(function(){
                $("#chat_inside").show('slide', function () {
                    $('#chat').scrollTop($('#chat')[0].scrollHeight);
                });
            });
            
            $("#chat_close").click(function(e){
                $("#chat_inside").hide('slide');
            });
            
            $("#chat_send_message").click(function(){
                chat.sendMessage();
            });
            
            $("#chat_form").submit(function(){
                return false;
            });
            
            $("#chat_check_public input").click(function(){
                chat.checkVisibility();
            });
            $("#chat_check_private input").click(function(){
                chat.checkVisibility();
            });
            
            $("#chat").on("click", ".sender", function(event){
                $("#chat_new_message").val("/pm " + $(this).html() + " ");
                $("#chat_new_message").focus();
            });
            $("#chat").on("click", ".recipient", function(event){
                $("#chat_new_message").val("/pm " + $(this).html() + " ");
                $("#chat_new_message").focus();
            });
        },
};

