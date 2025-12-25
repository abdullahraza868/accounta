// Temporary file - adding reminder phase display to payment status

// ADD AFTER LINE 607 (after the closing )})
        
        {/* Show reminder phase info */}
        {subscription.reminderPhase && !subscription.remindersSuspended && (
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[11px] text-blue-700 dark:text-blue-400 font-medium">
              Sending Reminders {subscription.reminderPhase.current}/{subscription.reminderPhase.total}
            </span>
          </div>
        )}
        
        {/* Show reminders suspended status */}
        {subscription.remindersSuspended && (
          <div className="flex items-center gap-1.5 mt-0.5">
            <Badge className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 border border-amber-300 dark:border-amber-700 text-[10px] px-1.5 py-0">
              <BellOff className="w-2.5 h-2.5 mr-1" />
              Reminders Suspended
            </Badge>
          </div>
        )}
