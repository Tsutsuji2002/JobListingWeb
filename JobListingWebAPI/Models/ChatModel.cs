namespace JobListingWebAPI.Models
{
    public class ChatConversationModel
    {
        public string? RoomId { get; set; }
        public string? EmployerId { get; set; }
        public string? ApplicantId { get; set; }
        public ChatParticipantModel? Employer { get; set; }
        public ChatParticipantModel? Applicant { get; set; }
        public ChatMessageModel? LastMessage { get; set; }
        public int UnreadCount { get; set; }
        public string? JobTitle { get; set; }
    }

    public class ChatParticipantModel
    {
        public string? Id { get; set; }
        public string? Name { get; set; }
        public string? ProfilePicture { get; set; }
    }

    public class ChatMessageModel
    {
        public string? Id { get; set; }
        public string? SenderId { get; set; }
        public string? Message { get; set; }
        public DateTime Timestamp { get; set; }
        public string? Type { get; set; }
        public string? FileName { get; set; }
        public string? FileUrl { get; set; }
        public bool IsRead { get; set; }
    }

    public class ChatRoomModel
    {
        public string? Id { get; set; }
        public string? EmployerId { get; set; }
        public string? ApplicantId { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class CreateChatRoomModel
    {
        public string? EmployerId { get; set; }
        public string? ApplicantId { get; set; }
    }
    public class FileUploadResponseModel
    {
        public string? FileName { get; set; }
        public string? FileUrl { get; set; }
        public string? MessageId { get; set; }
    }
}
