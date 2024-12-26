package net.tylerwade.discord.lib.util;

import java.text.SimpleDateFormat;
import java.util.Date;

public class DateTimeUtil {

    public static String getCurrentTimeStampString() {
        String timestamp = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date());
        return timestamp;
    }

    public static String getTimestampIn7Days() {
        long currentTime = System.currentTimeMillis();
        long sevenDays = 7 * 24 * 60 * 60 * 1000;
        long futureTime = currentTime + sevenDays;
        String timestamp = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date(futureTime));
        return timestamp;
    }

    public static Date convertStringToDate(String expiresAt) {
        try {
            return new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").parse(expiresAt);
        } catch (Exception e) {
            return null;
        }
    }
}
