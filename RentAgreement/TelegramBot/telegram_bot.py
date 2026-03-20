




# import os
# import requests
# from dotenv import load_dotenv
# from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, ReplyKeyboardRemove
# from telegram.constants import ParseMode
# from telegram.ext import (
#     ApplicationBuilder,
#     CommandHandler,
#     MessageHandler,
#     ConversationHandler,
#     ContextTypes,
#     filters,
#     CallbackQueryHandler,
# )

# load_dotenv()

# # Configuration
# BOT_TOKEN = os.getenv("BOT_TOKEN")
# BACKEND_BASE_URL = os.getenv("BACKEND_BASE_URL")

# # API Endpoints
# DRAFT_API = f"{BACKEND_BASE_URL}/telegram/create-draft"
# UPLOAD_API = f"{BACKEND_BASE_URL}/telegram/upload-document"
# GENERATE_PDF_API = f"{BACKEND_BASE_URL}/telegram/generate-pdf"

# # ---------------- STATES ----------------
# ASK_DETAILS, CONFIRMATION, EDIT_CHOICE, UPLOADING_DOCS = range(4)

# # ---------------- FIELDS SETUP ----------------
# # List of (key, label) for questions
# FORM_FIELDS = [
#     ("owner_name", "👤 Owner Name"),
#     ("owner_mobile", "📱 Owner Mobile"),
#     ("owner_aadhaar", "🆔 Owner Aadhaar number"),
#     ("tenant_name", "👤 Tenant Name"),
#     ("tenant_mobile", "📱 Tenant Mobile"),
#     ("tenant_aadhaar", "🆔 Tenant Aadhaar number"),
#     ("address", "🏠 Property Address"),
#     ("city", "🌆 City"),
#     ("rent", "💰 Monthly Rent"),
#     ("deposit", "🏦 Deposit Amount"),
#     ("start_date", "📅 Start Date (YYYY-MM-DD)"),
#     ("end_date", "📅 End Date (YYYY-MM-DD)")
# ]

# # ---------------- HELPERS ----------------
# async def show_preview(update: Update, context: ContextTypes.DEFAULT_TYPE):
#     summary = "📋 *Review Your Details:*\n\n"
#     for key, label in FORM_FIELDS:
#         val = context.user_data.get(key, "N/A")
#         summary += f"*{label}:* {val}\n"
    
#     keyboard = [
#         [InlineKeyboardButton("✅ All Correct", callback_data="confirm")],
#         [InlineKeyboardButton("✏️ Edit Details", callback_data="edit")],
#         [InlineKeyboardButton("❌ Cancel", callback_data="cancel")]
#     ]
#     reply_markup = InlineKeyboardMarkup(keyboard)
    
#     msg = update.callback_query.message if update.callback_query else update.message
#     await msg.reply_text(summary, parse_mode=ParseMode.MARKDOWN, reply_markup=reply_markup)
#     return CONFIRMATION

# # ---------------- START ----------------
# async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
#     context.user_data.clear()
#     context.user_data["step"] = 0
#     await update.message.reply_text("🚀 *Welcome to RentDraft AI*\nLet's start your agreement.", parse_mode=ParseMode.MARKDOWN)
    
#     first_label = FORM_FIELDS[0][1]
#     await update.message.reply_text(f"Please enter: *{first_label}*", parse_mode=ParseMode.MARKDOWN)
#     return ASK_DETAILS

# # ---------------- DETAIL COLLECTION ----------------
# async def collect_details(update: Update, context: ContextTypes.DEFAULT_TYPE):
#     step = context.user_data.get("step", 0)
#     key = FORM_FIELDS[step][0]
#     context.user_data[key] = update.message.text
    
#     if step + 1 < len(FORM_FIELDS):
#         context.user_data["step"] = step + 1
#         next_label = FORM_FIELDS[step + 1][1]
#         await update.message.reply_text(f"Next: *{next_label}*", parse_mode=ParseMode.MARKDOWN)
#         return ASK_DETAILS
#     else:
#         return await show_preview(update, context)

# # ---------------- CONFIRMATION & EDIT LOGIC ----------------
# async def handle_confirmation(update: Update, context: ContextTypes.DEFAULT_TYPE):
#     query = update.callback_query
#     await query.answer()
    
#     if query.data == "confirm":
#         # API Call to backend to save data
#         try:
#             res = requests.post(DRAFT_API, json=context.user_data)
#             if res.status_code == 200:
#                 context.user_data["agreement_id"] = res.json()["agreement_id"]
#                 await query.edit_message_text("✅ *Details Confirmed!*\n\nNow, please upload **Aadhaar Card** photo:", parse_mode=ParseMode.MARKDOWN)
#                 context.user_data["doc_step"] = "Aadhaar"
#                 return UPLOADING_DOCS
#         except:
#             await query.edit_message_text("❌ Backend Connection Error.")
#             return ConversationHandler.END

#     elif query.data == "edit":
#         keyboard = [[InlineKeyboardButton(label, callback_data=f"edt_{key}")] for key, label in FORM_FIELDS]
#         await query.edit_message_text("Which field do you want to change?", reply_markup=InlineKeyboardMarkup(keyboard))
#         return EDIT_CHOICE

#     elif query.data == "cancel":
#         await query.edit_message_text("Process cancelled. Type /start to begin again.")
#         return ConversationHandler.END

# async def handle_edit_selection(update: Update, context: ContextTypes.DEFAULT_TYPE):
#     query = update.callback_query
#     await query.answer()
#     field_key = query.data.replace("edt_", "")
#     context.user_data["editing_key"] = field_key
    
#     # Find label
#     label = next(l for k, l in FORM_FIELDS if k == field_key)
#     await query.edit_message_text(f"Enter new value for: *{label}*", parse_mode=ParseMode.MARKDOWN)
#     return ASK_DETAILS

# # ---------------- GUIDED UPLOADS ----------------
# async def handle_docs(update: Update, context: ContextTypes.DEFAULT_TYPE):
#     if not update.message.photo:
#         await update.message.reply_text("Please send a photo.")
#         return UPLOADING_DOCS
    
#     current_doc = context.user_data.get("doc_step")
#     ag_id = context.user_data.get("agreement_id")
    
#     # Upload to Backend
#     photo = update.message.photo[-1]
#     tg_file = await photo.get_file()
#     file_bytes = await tg_file.download_as_bytearray()
    
#     files = {"file": (f"{current_doc}.jpg", file_bytes, "image/jpeg")}
#     data = {"agreement_id": ag_id, "doc_type": current_doc}
    
#     res = requests.post(UPLOAD_API, data=data, files=files)
    
#     if res.status_code == 200:
#         if current_doc == "Aadhaar":
#             context.user_data["doc_step"] = "PAN"
#             await update.message.reply_text("✅ Aadhaar Uploaded. Now send **PAN Card** photo:")
#             return UPLOADING_DOCS
#         elif current_doc == "PAN":
#             context.user_data["doc_step"] = "Property"
#             await update.message.reply_text("✅ PAN Uploaded. Now send **Property Document** photo:")
#             return UPLOADING_DOCS
#         else:
#             await update.message.reply_text("🎉 All documents uploaded! Generating your PDF...")
#             return await send_final_pdf(update, context)
#     else:
#         await update.message.reply_text("Upload failed. Try sending the photo again.")
#         return UPLOADING_DOCS

# # ---------------- FINAL PDF ----------------
# async def send_final_pdf(update: Update, context: ContextTypes.DEFAULT_TYPE):
#     ag_id = context.user_data.get("agreement_id")
#     try:
#         # Request PDF from backend
#         res = requests.get(f"{GENERATE_PDF_API}/{ag_id}")
#         if res.status_code == 200:
#             await update.message.reply_document(
#                 document=res.content,
#                 filename=f"Rent_Agreement_{ag_id}.pdf",
#                 caption="📄 Here is your Draft Agreement PDF."
#             )
#         else:
#             await update.message.reply_text(" PDF generation failed.")
#     except:
#         await update.message.reply_text(" Server Error while fetching PDF.")
    
#     return ConversationHandler.END

# # ---------------- MAIN ----------------
# def main():
#     app = ApplicationBuilder().token(BOT_TOKEN).build()

#     conv_handler = ConversationHandler(
#         entry_points=[CommandHandler("start", start)],
#         states={
#             ASK_DETAILS: [MessageHandler(filters.TEXT & ~filters.COMMAND, collect_details)],
#             CONFIRMATION: [CallbackQueryHandler(handle_confirmation)],
#             EDIT_CHOICE: [CallbackQueryHandler(handle_edit_selection)],
#             UPLOADING_DOCS: [MessageHandler(filters.PHOTO, handle_docs)],
#         },
#         fallbacks=[CommandHandler("close", lambda u, c: ConversationHandler.END)],
#         per_message=False
#     )

#     app.add_handler(conv_handler)
#     print("🤖 Advanced RentDraftBot is live...")
#     app.run_polling()

# if __name__ == "__main__":
#     main()












import os
import requests
from dotenv import load_dotenv
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, ReplyKeyboardRemove
from telegram.constants import ParseMode
from telegram.ext import (
    ApplicationBuilder,
    CommandHandler,
    MessageHandler,
    ConversationHandler,
    ContextTypes,
    filters,
    CallbackQueryHandler,
)

load_dotenv()

# Configuration
BOT_TOKEN = os.getenv("BOT_TOKEN")
BACKEND_BASE_URL = os.getenv("BACKEND_BASE_URL")

# API Endpoints
DRAFT_API = f"{BACKEND_BASE_URL}/telegram/create-draft"
UPLOAD_API = f"{BACKEND_BASE_URL}/telegram/upload-document"
GENERATE_PDF_API = f"{BACKEND_BASE_URL}/telegram/generate-pdf"

# ---------------- STATES ----------------
ASK_DETAILS, CONFIRMATION, EDIT_CHOICE, UPLOADING_DOCS = range(4)

# ---------------- FIELDS SETUP ----------------
# List of (key, label) for questions
FORM_FIELDS = [
    ("owner_name", "👤 Owner Name"),
    ("owner_mobile", "📱 Owner Mobile"),
    ("owner_aadhaar", "🆔 Owner Aadhaar number"),
    ("tenant_name", "👤 Tenant Name"),
    ("tenant_mobile", "📱 Tenant Mobile"),
    ("tenant_aadhaar", "🆔 Tenant Aadhaar number"),
    ("address", "🏠 Property Address"),
    ("city", "🌆 City"),
    ("rent", "💰 Monthly Rent"),
    ("deposit", "🏦 Deposit Amount"),
    ("start_date", "📅 Start Date (YYYY-MM-DD)"),
    ("end_date", "📅 End Date (YYYY-MM-DD)")
]

# ---------------- HELPERS ----------------
async def show_preview(update: Update, context: ContextTypes.DEFAULT_TYPE):
    summary = "📋 *Review Your Details:*\n\n"
    for key, label in FORM_FIELDS:
        val = context.user_data.get(key, "N/A")
        summary += f"*{label}:* {val}\n"
    
    keyboard = [
        [InlineKeyboardButton("✅ All Correct", callback_data="confirm")],
        [InlineKeyboardButton("✏️ Edit Details", callback_data="edit")],
        [InlineKeyboardButton("❌ Cancel", callback_data="cancel")]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    msg = update.callback_query.message if update.callback_query else update.message
    await msg.reply_text(summary, parse_mode=ParseMode.MARKDOWN, reply_markup=reply_markup)
    return CONFIRMATION

# ---------------- START ----------------
async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    context.user_data.clear()
    context.user_data["step"] = 0
    await update.message.reply_text("🚀 *Welcome to RentDraft AI*\nLet's start your agreement.", parse_mode=ParseMode.MARKDOWN)
    
    first_label = FORM_FIELDS[0][1]
    await update.message.reply_text(f"Please enter: *{first_label}*", parse_mode=ParseMode.MARKDOWN)
    return ASK_DETAILS

# ---------------- DETAIL COLLECTION (English Validation) ----------------
async def collect_details(update: Update, context: ContextTypes.DEFAULT_TYPE):
    step = context.user_data.get("step", 0)
    key = FORM_FIELDS[step][0]
    label = FORM_FIELDS[step][1]
    user_input = update.message.text

    # --- MOBILE VALIDATION (English) ---
    if key in ["owner_mobile", "tenant_mobile"]:
        if not (user_input.isdigit() and len(user_input) == 10):
            await update.message.reply_text(
                f"❌ *Invalid Number!*\n\nThe number you entered is incorrect. Please enter exactly *10 digits* for *{label}*:", 
                parse_mode=ParseMode.MARKDOWN
            )
            return ASK_DETAILS 

    # --- AADHAAR VALIDATION (English) ---
    if key in ["owner_aadhaar", "tenant_aadhaar"]:
        if not (user_input.isdigit() and len(user_input) == 12):
            await update.message.reply_text(
                f"❌ *Invalid Aadhaar!*\n\nAadhaar number must be exactly *12 digits*. Please try again:", 
                parse_mode=ParseMode.MARKDOWN
            )
            return ASK_DETAILS

    context.user_data[key] = user_input
    
    if step + 1 < len(FORM_FIELDS):
        context.user_data["step"] = step + 1
        next_label = FORM_FIELDS[step + 1][1]
        await update.message.reply_text(f"Next: *{next_label}*", parse_mode=ParseMode.MARKDOWN)
        return ASK_DETAILS
    else:
        return await show_preview(update, context)

# ---------------- CONFIRMATION & EDIT LOGIC ----------------
async def handle_confirmation(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()
    
    if query.data == "confirm":
        # Filter data for backend
        allowed_keys = [field[0] for field in FORM_FIELDS]
        clean_data = {k: v for k, v in context.user_data.items() if k in allowed_keys}
        
        try:
            res = requests.post(DRAFT_API, json=clean_data)
            if res.status_code == 200:
                context.user_data["agreement_id"] = res.json()["agreement_id"]
                await query.edit_message_text("✅ *Details Confirmed!*\n\nNow, please upload **Aadhaar Card** photo:", parse_mode=ParseMode.MARKDOWN)
                context.user_data["doc_step"] = "Aadhaar"
                return UPLOADING_DOCS
            else:
                await query.edit_message_text(f"❌ Backend Error: {res.status_code}. Please check your inputs.")
                return ConversationHandler.END
        except:
            await query.edit_message_text("❌ Backend Connection Error.")
            return ConversationHandler.END

    elif query.data == "edit":
        keyboard = [[InlineKeyboardButton(label, callback_data=f"edt_{key}")] for key, label in FORM_FIELDS]
        await query.edit_message_text("Which field do you want to change?", reply_markup=InlineKeyboardMarkup(keyboard))
        return EDIT_CHOICE

    elif query.data == "cancel":
        await query.edit_message_text("Process cancelled. Type /start to begin again.")
        return ConversationHandler.END

async def handle_edit_selection(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()
    field_key = query.data.replace("edt_", "")
    context.user_data["editing_key"] = field_key
    
    label = next(l for k, l in FORM_FIELDS if k == field_key)
    await query.edit_message_text(f"Enter new value for: *{label}*", parse_mode=ParseMode.MARKDOWN)
    return ASK_DETAILS

# ---------------- GUIDED UPLOADS ----------------
async def handle_docs(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if not update.message.photo:
        await update.message.reply_text("Please send a photo.")
        return UPLOADING_DOCS
    
    current_doc = context.user_data.get("doc_step")
    ag_id = context.user_data.get("agreement_id")
    
    photo = update.message.photo[-1]
    tg_file = await photo.get_file()
    file_bytes = await tg_file.download_as_bytearray()
    
    files = {"file": (f"{current_doc}.jpg", file_bytes, "image/jpeg")}
    data = {"agreement_id": ag_id, "doc_type": current_doc}
    
    res = requests.post(UPLOAD_API, data=data, files=files)
    
    if res.status_code == 200:
        if current_doc == "Aadhaar":
            context.user_data["doc_step"] = "PAN"
            await update.message.reply_text("✅ Aadhaar Uploaded. Now send **PAN Card** photo:")
            return UPLOADING_DOCS
        elif current_doc == "PAN":
            context.user_data["doc_step"] = "Property"
            await update.message.reply_text("✅ PAN Uploaded. Now send **Property Document** photo:")
            return UPLOADING_DOCS
        else:
            await update.message.reply_text("🎉 All documents uploaded! Generating your PDF...")
            return await send_final_pdf(update, context)
    else:
        await update.message.reply_text("Upload failed. Try sending the photo again.")
        return UPLOADING_DOCS

# ---------------- FINAL PDF ----------------
async def send_final_pdf(update: Update, context: ContextTypes.DEFAULT_TYPE):
    ag_id = context.user_data.get("agreement_id")
    try:
        res = requests.get(f"{GENERATE_PDF_API}/{ag_id}")
        if res.status_code == 200:
            await update.message.reply_document(
                document=res.content,
                filename=f"Rent_Agreement_{ag_id}.pdf",
                caption="📄 Here is your Draft Agreement PDF."
            )
        else:
            await update.message.reply_text("❌ PDF generation failed.")
    except:
        await update.message.reply_text("❌ Server Error while fetching PDF.")
    
    return ConversationHandler.END

# ---------------- MAIN ----------------
def main():
    # job_queue=None prevents timezone errors
    app = ApplicationBuilder().token(BOT_TOKEN).job_queue(None).build()

    conv_handler = ConversationHandler(
        entry_points=[CommandHandler("start", start)],
        states={
            ASK_DETAILS: [MessageHandler(filters.TEXT & ~filters.COMMAND, collect_details)],
            CONFIRMATION: [CallbackQueryHandler(handle_confirmation)],
            EDIT_CHOICE: [CallbackQueryHandler(handle_edit_selection)],
            UPLOADING_DOCS: [MessageHandler(filters.PHOTO, handle_docs)],
        },
        fallbacks=[CommandHandler("close", lambda u, c: ConversationHandler.END)],
        per_message=False
    )

    app.add_handler(conv_handler)
    print("🤖 RentDraftBot is live (English version)...")
    app.run_polling(drop_pending_updates=True)

if __name__ == "__main__":
    main()