namespace JobListingWebAPI.Exceptions
{
    public class DuplicateSubscriptionException : Exception
    {
        public DuplicateSubscriptionException() : base("Email is already subscribed") { }
    }

    public class SubscriptionNotFoundException : Exception
    {
        public SubscriptionNotFoundException() : base("Subscription not found") { }
    }
}
