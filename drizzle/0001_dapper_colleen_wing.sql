CREATE TABLE "couple_space_members" (
	"id" text PRIMARY KEY NOT NULL,
	"space_id" text NOT NULL,
	"user_id" text NOT NULL,
	"joined_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "couple_spaces" (
	"id" text PRIMARY KEY NOT NULL,
	"status" text DEFAULT 'PENDING' NOT NULL,
	"custom_name" text,
	"anniversary_date" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "space_invitations" (
	"id" text PRIMARY KEY NOT NULL,
	"space_id" text NOT NULL,
	"inviter_user_id" text NOT NULL,
	"token_hash" text NOT NULL,
	"status" text DEFAULT 'PENDING' NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"accepted_at" timestamp with time zone,
	"accepted_by_user_id" text,
	CONSTRAINT "space_invitations_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
ALTER TABLE "couple_space_members" ADD CONSTRAINT "couple_space_members_space_id_couple_spaces_id_fk" FOREIGN KEY ("space_id") REFERENCES "public"."couple_spaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "couple_space_members" ADD CONSTRAINT "couple_space_members_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "space_invitations" ADD CONSTRAINT "space_invitations_space_id_couple_spaces_id_fk" FOREIGN KEY ("space_id") REFERENCES "public"."couple_spaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "space_invitations" ADD CONSTRAINT "space_invitations_inviter_user_id_user_id_fk" FOREIGN KEY ("inviter_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "space_invitations" ADD CONSTRAINT "space_invitations_accepted_by_user_id_user_id_fk" FOREIGN KEY ("accepted_by_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "couple_space_members_space_user_unique" ON "couple_space_members" USING btree ("space_id","user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "couple_space_members_user_unique" ON "couple_space_members" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "couple_space_members_space_idx" ON "couple_space_members" USING btree ("space_id");--> statement-breakpoint
CREATE INDEX "couple_space_members_user_idx" ON "couple_space_members" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "couple_spaces_status_idx" ON "couple_spaces" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "space_invitations_token_hash_unique" ON "space_invitations" USING btree ("token_hash");--> statement-breakpoint
CREATE INDEX "space_invitations_space_idx" ON "space_invitations" USING btree ("space_id");--> statement-breakpoint
CREATE INDEX "space_invitations_inviter_idx" ON "space_invitations" USING btree ("inviter_user_id");