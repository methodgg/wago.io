dofile("./base.lua")

local LibBase64 = LibStub("LibBase64-1.0")

assert_equal(LibBase64.Encode(""), "")
assert_equal(LibBase64.Encode("\000"), "AA==")
assert_equal(LibBase64.Encode("Hey"), "SGV5")
assert_equal(LibBase64.Encode("Hello, how are you doing today?"), "SGVsbG8sIGhvdyBhcmUgeW91IGRvaW5nIHRvZGF5Pw==")
local s = ''
for i = 0, 255 do
 s = s .. string.char(i)
end
assert_equal(LibBase64.Encode(s), "AAECAwQFBgcICQoLDA0ODxAREhMUFRYXGBkaGxwdHh8gISIjJCUmJygpKissLS4vMDEyMzQ1Njc4OTo7PD0+P0BBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWltcXV5fYGFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6e3x9fn+AgYKDhIWGh4iJiouMjY6PkJGSk5SVlpeYmZqbnJ2en6ChoqOkpaanqKmqq6ytrq+wsbKztLW2t7i5uru8vb6/wMHCw8TFxsfIycrLzM3Oz9DR0tPU1dbX2Nna29zd3t/g4eLj5OXm5+jp6uvs7e7v8PHy8/T19vf4+fr7/P3+/w==")
assert_equal(LibBase64.Encode(s, 76), "AAECAwQFBgcICQoLDA0ODxAREhMUFRYXGBkaGxwdHh8gISIjJCUmJygpKissLS4vMDEyMzQ1Njc4\r\nOTo7PD0+P0BBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWltcXV5fYGFiY2RlZmdoaWprbG1ub3Bx\r\ncnN0dXZ3eHl6e3x9fn+AgYKDhIWGh4iJiouMjY6PkJGSk5SVlpeYmZqbnJ2en6ChoqOkpaanqKmq\r\nq6ytrq+wsbKztLW2t7i5uru8vb6/wMHCw8TFxsfIycrLzM3Oz9DR0tPU1dbX2Nna29zd3t/g4eLj\r\n5OXm5+jp6uvs7e7v8PHy8/T19vf4+fr7/P3+/w==")
s = '!' .. s
assert_equal(LibBase64.Encode(s), "IQABAgMEBQYHCAkKCwwNDg8QERITFBUWFxgZGhscHR4fICEiIyQlJicoKSorLC0uLzAxMjM0NTY3ODk6Ozw9Pj9AQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVpbXF1eX2BhYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ent8fX5/gIGCg4SFhoeIiYqLjI2Oj5CRkpOUlZaXmJmam5ydnp+goaKjpKWmp6ipqqusra6vsLGys7S1tre4ubq7vL2+v8DBwsPExcbHyMnKy8zNzs/Q0dLT1NXW19jZ2tvc3d7f4OHi4+Tl5ufo6err7O3u7/Dx8vP09fb3+Pn6+/z9/v8=")
assert_equal(LibBase64.Encode(s, 76), "IQABAgMEBQYHCAkKCwwNDg8QERITFBUWFxgZGhscHR4fICEiIyQlJicoKSorLC0uLzAxMjM0NTY3\r\nODk6Ozw9Pj9AQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVpbXF1eX2BhYmNkZWZnaGlqa2xtbm9w\r\ncXJzdHV2d3h5ent8fX5/gIGCg4SFhoeIiYqLjI2Oj5CRkpOUlZaXmJmam5ydnp+goaKjpKWmp6ip\r\nqqusra6vsLGys7S1tre4ubq7vL2+v8DBwsPExcbHyMnKy8zNzs/Q0dLT1NXW19jZ2tvc3d7f4OHi\r\n4+Tl5ufo6err7O3u7/Dx8vP09fb3+Pn6+/z9/v8=")
s = '!' .. s
assert_equal(LibBase64.Encode(s), "ISEAAQIDBAUGBwgJCgsMDQ4PEBESExQVFhcYGRobHB0eHyAhIiMkJSYnKCkqKywtLi8wMTIzNDU2Nzg5Ojs8PT4/QEFCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaW1xdXl9gYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXp7fH1+f4CBgoOEhYaHiImKi4yNjo+QkZKTlJWWl5iZmpucnZ6foKGio6SlpqeoqaqrrK2ur7CxsrO0tba3uLm6u7y9vr/AwcLDxMXGx8jJysvMzc7P0NHS09TV1tfY2drb3N3e3+Dh4uPk5ebn6Onq6+zt7u/w8fLz9PX29/j5+vv8/f7/")
assert_equal(LibBase64.Encode(s, 76), "ISEAAQIDBAUGBwgJCgsMDQ4PEBESExQVFhcYGRobHB0eHyAhIiMkJSYnKCkqKywtLi8wMTIzNDU2\r\nNzg5Ojs8PT4/QEFCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaW1xdXl9gYWJjZGVmZ2hpamtsbW5v\r\ncHFyc3R1dnd4eXp7fH1+f4CBgoOEhYaHiImKi4yNjo+QkZKTlJWWl5iZmpucnZ6foKGio6Slpqeo\r\nqaqrrK2ur7CxsrO0tba3uLm6u7y9vr/AwcLDxMXGx8jJysvMzc7P0NHS09TV1tfY2drb3N3e3+Dh\r\n4uPk5ebn6Onq6+zt7u/w8fLz9PX29/j5+vv8/f7/")
s = '!' .. s
assert_equal(LibBase64.Encode(s), "ISEhAAECAwQFBgcICQoLDA0ODxAREhMUFRYXGBkaGxwdHh8gISIjJCUmJygpKissLS4vMDEyMzQ1Njc4OTo7PD0+P0BBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWltcXV5fYGFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6e3x9fn+AgYKDhIWGh4iJiouMjY6PkJGSk5SVlpeYmZqbnJ2en6ChoqOkpaanqKmqq6ytrq+wsbKztLW2t7i5uru8vb6/wMHCw8TFxsfIycrLzM3Oz9DR0tPU1dbX2Nna29zd3t/g4eLj5OXm5+jp6uvs7e7v8PHy8/T19vf4+fr7/P3+/w==")
assert_equal(LibBase64.Encode(s, 76), "ISEhAAECAwQFBgcICQoLDA0ODxAREhMUFRYXGBkaGxwdHh8gISIjJCUmJygpKissLS4vMDEyMzQ1\r\nNjc4OTo7PD0+P0BBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWltcXV5fYGFiY2RlZmdoaWprbG1u\r\nb3BxcnN0dXZ3eHl6e3x9fn+AgYKDhIWGh4iJiouMjY6PkJGSk5SVlpeYmZqbnJ2en6ChoqOkpaan\r\nqKmqq6ytrq+wsbKztLW2t7i5uru8vb6/wMHCw8TFxsfIycrLzM3Oz9DR0tPU1dbX2Nna29zd3t/g\r\n4eLj5OXm5+jp6uvs7e7v8PHy8/T19vf4+fr7/P3+/w==")

for i = 0, 255 do
 assert_equal(LibBase64.Decode(LibBase64.Encode(string.char(i))), string.char(i))
end

for i = 1, 1000 do
 local s = ''
 for j = 1, i do
     s = s .. string.char(math.random(0, 255))
 end
 assert_equal(LibBase64.Decode(LibBase64.Encode(s)), s)
 assert_equal(LibBase64.Decode(LibBase64.Encode(s, 76)), s)
end

assert_error([=[Bad argument #1 to `Encode'. Expected "string", got "number"]=], LibBase64.Encode, 1234)
assert_error([=[Bad argument #2 to `Encode'. Expected "number" or "nil", got "string"]=], LibBase64.Encode, "Hello", "There")
assert_error([=[Bad argument #2 to `Encode'. Expected a multiple of 4, got 75]=], LibBase64.Encode, "Hello", 75)
assert_error([=[Bad argument #2 to `Encode'. Expected a number > 0, got -4]=], LibBase64.Encode, "Hello", -4)
assert_error([=[Bad argument #2 to `Encode'. Expected a number > 0, got 0]=], LibBase64.Encode, "Hello", 0)

assert_error([=[Bad argument #1 to `Decode'. Expected "string", got "number"]=], LibBase64.Decode, 1234)
assert_error([=[Bad argument #1 to `Decode'. Received an invalid char: "!"]=], LibBase64.Decode, "!@#$")

print("Tests complete")
