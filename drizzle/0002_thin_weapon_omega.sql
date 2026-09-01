CREATE TABLE "mood_status" (
	"id" text PRIMARY KEY NOT NULL,
	"space_id" text NOT NULL,
	"user_id" text NOT NULL,
	"mood" text NOT NULL,
	"message" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "mood_status" ADD CONSTRAINT "mood_status_space_id_couple_spaces_id_fk" FOREIGN KEY ("space_id") REFERENCES "public"."couple_spaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mood_status" ADD CONSTRAINT "mood_status_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "mood_status_space_user_unique" ON "mood_status" USING btree ("space_id","user_id");--> statement-breakpoint
CREATE INDEX "mood_status_space_idx" ON "mood_status" USING btree ("space_id");--> statement-breakpoint
CREATE INDEX "mood_status_user_idx" ON "mood_status" USING btree ("user_id");