# AGENT.md

## Project

Football Booking System

## Stack

* Next.js (App Router)
* TypeScript
* Tailwind CSS
* PostgreSQL
* Prisma ORM

## Features

### Customer

* LINE Login
* View courts
* Book courts
* Upload payment slips
* View booking history
* Receive notifications via LINE OA

### Admin

* Dashboard
* Court management
* Booking management
* Payment verification
* Booking history
* Revenue reports

## Database

* users
* courts
* bookings
* payments

## Booking Status

pending | paid | confirmed | cancelled | completed

## Payment Status

unpaid | pending_verify | verified | rejected

## Development Rules

* Use TypeScript only
* Build reusable components
* Keep business logic separate from UI
* Make all pages responsive
* Use Prisma for database access
* Store secrets in .env only
* Run build and fix errors before finishing

## AI Instructions

* Analyze before making changes
* Modify only related code
* Avoid breaking changes
* Follow existing code style
* Summarize changes after each task


ควรทำก่อน
Database + Prisma
หน้าเลือกสนาม/เวลา
ระบบจอง
Admin ดูรายการจอง
อัปโหลดสลิป
LINE แจ้งเตือน

ทำแค่นี้ก่อนก็ขายให้สนามแรกใช้งานจริงได้แล้วครับ.


# LINE Login
LINE_CLIENT_ID=2010400098
LINE_CLIENT_SECRET=3fde521c9b07234b544db0d836d60162

# Messaging API
LINE_CHANNEL_ID=2010400098
LINE_CHANNEL_SECRET=be9f82c93c8947286779d200cf22d600
LINE_CHANNEL_ACCESS_TOKEN=XBcxdZBgT5BjTCRzmH5Xf9Zj/Rkzr3ZryQsZxRuiHMNRbGkqQEtDHM/nCTgWQu3GVpXLMqgJjO4I8iYnTxtjMPE1gPRJn61DBEbF+0QDIdcMZb3CKKey44FXhXdyaPZ2JAUON14kRCIuDt21LDWf4AdB04t89/1O/w1cDnyilFU=

NEXT_PUBLIC_APP_URL=http://localhost:3000