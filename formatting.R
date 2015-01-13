df <- read.csv('Downloads/454789.csv', header = TRUE, as.is = TRUE)
require(lubridate)
weather <- df
weather$hour <- hour(weather$Date)
weather$Date <- strptime(weather$DATE, "%Y%m%d %H:%M")
weather$hour <- hour(weather$Date)
weather$day <- as.Date(weather$Date)
weather <- subset(weather, select = -STATION)
weather <- subset(weather, select = -DATE)
weather <- subset(weather, select = -Date)
weather$HLY.TEMP.NORMAL <- weather$HLY.TEMP.NORMAL / 10
weather$HLY.CLOD.PCTOVC <- weather$HLY.CLOD.PCTOVC / 10
stations <- read.csv('station_name.csv', header = TRUE, as.is = TRUE)
names(stations) = c("STATION_NAME", "city")
k <- merge(weather, stations, all.y = TRUE)
k <- subset(k, select = -STATION_NAME)
names(k) <- c("HLYCLODPCTOVC", "HLYTEMPNORMAL", "hour", "day", "city")
write.csv(k, 'learninghtml/webProjects/weatherHourlyAltTooltip/twentyCities.csv', row.names = FALSE, quote = FALSE)
