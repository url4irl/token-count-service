CREATE TABLE "analysis_logs" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "analysis_logs_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"documentId" integer NOT NULL,
	"userId" varchar(255) NOT NULL,
	"status" varchar(20) NOT NULL,
	"details" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "documents" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "documents_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"userId" varchar(255),
	"content" text NOT NULL,
	"tokenCount" integer,
	"analysis" jsonb,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "documents_id_userId_unique" UNIQUE("id","userId")
);
--> statement-breakpoint
ALTER TABLE "analysis_logs" ADD CONSTRAINT "analysis_logs_documentId_documents_id_fk" FOREIGN KEY ("documentId") REFERENCES "public"."documents"("id") ON DELETE no action ON UPDATE no action;