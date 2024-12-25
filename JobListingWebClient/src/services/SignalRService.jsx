  import * as signalR from "@microsoft/signalr";

  class SignalRService {
    startConnection = async (token) => {
      try {
        console.log('Attempting SignalR connection with token:', token);
  
        this.connection = new signalR.HubConnectionBuilder()
          .withUrl("http://localhost:5070/chatHub", {
            accessTokenFactory: () => token,
            skipNegotiation: true,
            transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.ServerSentEvents | signalR.HttpTransportType.LongPolling
          })
          .withAutomaticReconnect()
          .configureLogging(signalR.LogLevel.Information) // Add detailed logging
          .build();
  
        this.connection.onclose((error) => {
          console.error('SignalR connection closed:', error);
        });
  
        this.connection.on("ReceiveMessage", (message) => {
          console.log("Received message:", message);
        });
  
        await this.connection.start();
        console.log("SignalR Connected successfully");
        return this.connection;
      } catch (error) {
        console.error('Detailed SignalR Connection Error:', {
          message: error.message,
          name: error.name,
          stack: error.stack
        });
        throw error;
      }
    };

    createOrJoinRoom = (employerId, applicantId) => {
      if (!this.connection) {
        throw new Error("SignalR connection not established");
      }

      return this.connection.invoke("CreateOrJoinRoom", employerId, applicantId);
    };

    sendMessage = (roomId, message) => {
      if (!this.connection) {
        throw new Error("SignalR connection not established");
      }

      return this.connection.invoke("SendMessage", roomId, message);
    };

    stopConnection = () => {
      if (this.connection) {
        return this.connection.stop();
      }
    };
  }
  const signalRServiceInstance = new SignalRService();
  export default signalRServiceInstance;
