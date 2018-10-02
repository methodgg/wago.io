pcall(function() dofile( "./libs/LibStub/LibStub.lua" ) end)
dofile( "./libs/AceSerializer-3.0/AceSerializer-3.0.lua" )
pcall(function() dofile( "./libs/LibDeflate/LibDeflate.lua" ) end)

local Serializer = LibStub:GetLibrary("AceSerializer-3.0")
local LibDeflate = LibStub:GetLibrary("LibDeflate")

local tbl = {
  ["outline"] = "OUTLINE",
  ["fontSize"] = 12,
  ["uid"] = "277Bw5PzFFi",
  ["xOffset"] = 0,
  ["displayText"] = "%n",
  ["yOffset"] = 0,
  ["anchorPoint"] = "CENTER",
  ["customTextUpdate"] = "update",
  ["automaticWidth"] = "Auto",
  ["actions"] = {
      ["start"] = {
      },
      ["init"] = {
          ["do_custom"] = true,
          ["custom"] = "-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n\\n\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n\\n\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n\\n\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n\\n\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n\\n\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n\\n\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n\\n\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n\\n\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n\\n\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n\\n\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n\\n\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n\\n\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n\\n\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n\\n\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n\\n\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n\\n\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n\\n\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n\\n\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n\\n\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n\\n\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n\\n\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n\\n\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n\\n\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n\\n\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n\\n\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n\\n\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n\\n\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n\\n\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n\\n\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n-- this is a test\\n\\n\\n",
      },
      ["finish"] = {
      },
  },
  ["triggers"] = {
    {
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },{
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
      ["untrigger"] = {
      },
    },
    {
      ["trigger"] = {
          ["type"] = "aura",
          ["subeventSuffix"] = "_CAST_START",
          ["event"] = "Health",
          ["unit"] = "player",
          ["spellIds"] = {
          },
          ["debuffType"] = "HELPFUL",
          ["names"] = {
              [1] = "",
          },
          ["subeventPrefix"] = "",
          ["buffShowOn"] = "",
      },
    },
    ["untrigger"] = {
    },
  },
  ["color"] = {
      [1] = 1,
      [2] = 1,
      [3] = 1,
      [4] = 1,
  },
  ["internalVersion"] = 9,
  ["justify"] = "LEFT",
  ["animation"] = {
      ["start"] = {
          ["type"] = "none",
          ["duration_type"] = "seconds",
      },
      ["main"] = {
          ["type"] = "none",
          ["duration_type"] = "seconds",
      },
      ["finish"] = {
          ["type"] = "none",
          ["duration_type"] = "seconds",
      },
  },
  ["id"] = "Totemic Revival",
  ["width"] = 20.555490493774,
  ["frameStrata"] = 1,
  ["anchorFrameType"] = "SCREEN",
  ["fixedWidth"] = 200,
  ["font"] = "Friz Quadrata TT",
  ["selfPoint"] = "BOTTOM",
  ["wordWrap"] = "WordWrap",
  ["height"] = 12.222240447998,
  ["conditions"] = {
  },
  ["load"] = {
      ["talent2"] = {
          ["multi"] = {
          },
      },
      ["talent"] = {
          ["multi"] = {
          },
      },
      ["class"] = {
          ["multi"] = {
          },
      },
      ["difficulty"] = {
          ["multi"] = {
          },
      },
      ["race"] = {
          ["multi"] = {
          },
      },
      ["role"] = {
          ["multi"] = {
          },
      },
      ["pvptalent"] = {
          ["multi"] = {
          },
      },
      ["ingroup"] = {
          ["multi"] = {
          },
      },
      ["faction"] = {
          ["multi"] = {
          },
      },
      ["spec"] = {
          ["multi"] = {
          },
      },
      ["size"] = {
          ["multi"] = {
          },
      },
  },
  ["regionType"] = "text",
}

local serialized = Serializer:Serialize(tbl)
local compressed = LibDeflate:CompressDeflate(serialized, {level = 9})
local encoded = "!" .. LibDeflate:EncodeForPrint(compressed)
print(string.len(encoded))