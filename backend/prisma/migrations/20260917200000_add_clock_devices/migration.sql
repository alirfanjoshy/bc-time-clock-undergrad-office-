CREATE TABLE "clock_devices" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "deviceHash" TEXT NOT NULL,
    "firstIp" TEXT,
    "boundAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "clock_devices_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "clock_devices_userId_key" ON "clock_devices"("userId");
CREATE UNIQUE INDEX "clock_devices_deviceHash_key" ON "clock_devices"("deviceHash");
ALTER TABLE "clock_devices" ADD CONSTRAINT "clock_devices_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
