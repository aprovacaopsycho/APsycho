import json

# CONFIG_PAGE_1 Data directly from the file
CONFIG_PAGE_1_RAW = { "imgWidth": 801, "imgHeight": 1024, "boxW": 50, "boxH": 50, "items": [{ "id": 0, "x": 108, "y": 40, "t": 0 }, { "id": 1, "x": 184, "y": 40, "t": 0 }, { "id": 2, "x": 259, "y": 40, "t": 1 }, { "id": 3, "x": 334, "y": 40, "t": 0 }, { "id": 4, "x": 519, "y": 40, "t": 1 }, { "id": 5, "x": 587, "y": 39, "t": 0 }, { "id": 6, "x": 663, "y": 40, "t": 0 }, { "id": 7, "x": 734, "y": 36, "t": 0 }, { "id": 8, "x": 109, "y": 116, "t": 1 }, { "id": 9, "x": 184, "y": 116, "t": 0 }, { "id": 10, "x": 259, "y": 116, "t": 0 }, { "id": 11, "x": 334, "y": 116, "t": 0 }, { "id": 12, "x": 519, "y": 116, "t": 0 }, { "id": 13, "x": 587, "y": 115, "t": 0 }, { "id": 14, "x": 663, "y": 116, "t": 0 }, { "id": 15, "x": 734, "y": 112, "t": 1 }, { "id": 16, "x": 112, "y": 196, "t": 0 }, { "id": 17, "x": 187, "y": 196, "t": 0 }, { "id": 18, "x": 262, "y": 196, "t": 0 }, { "id": 19, "x": 337, "y": 196, "t": 1 }, { "id": 20, "x": 522, "y": 196, "t": 0 }, { "id": 21, "x": 590, "y": 195, "t": 1 }, { "id": 22, "x": 666, "y": 196, "t": 0 }, { "id": 23, "x": 737, "y": 192, "t": 0 }, { "id": 24, "x": 109, "y": 279, "t": 0 }, { "id": 25, "x": 184, "y": 279, "t": 0 }, { "id": 26, "x": 259, "y": 279, "t": 1 }, { "id": 27, "x": 334, "y": 279, "t": 0 }, { "id": 28, "x": 519, "y": 279, "t": 0 }, { "id": 29, "x": 587, "y": 278, "t": 1 }, { "id": 30, "x": 663, "y": 279, "t": 0 }, { "id": 31, "x": 734, "y": 275, "t": 0 }, { "id": 32, "x": 108, "y": 357, "t": 0 }, { "id": 33, "x": 183, "y": 357, "t": 1 }, { "id": 34, "x": 258, "y": 357, "t": 0 }, { "id": 35, "x": 333, "y": 357, "t": 0 }, { "id": 36, "x": 518, "y": 357, "t": 1 }, { "id": 37, "x": 586, "y": 356, "t": 0 }, { "id": 38, "x": 662, "y": 357, "t": 0 }, { "id": 39, "x": 733, "y": 353, "t": 0 }, { "id": 40, "x": 114, "y": 438, "t": 0 }, { "id": 41, "x": 189, "y": 438, "t": 0 }, { "id": 42, "x": 264, "y": 438, "t": 0 }, { "id": 43, "x": 339, "y": 438, "t": 1 }, { "id": 44, "x": 524, "y": 438, "t": 0 }, { "id": 45, "x": 592, "y": 437, "t": 0 }, { "id": 46, "x": 668, "y": 438, "t": 1 }, { "id": 47, "x": 739, "y": 434, "t": 0 }, { "id": 48, "x": 113, "y": 522, "t": 1 }, { "id": 49, "x": 188, "y": 522, "t": 0 }, { "id": 50, "x": 263, "y": 522, "t": 0 }, { "id": 51, "x": 338, "y": 522, "t": 0 }, { "id": 52, "x": 523, "y": 522, "t": 0 }, { "id": 53, "x": 591, "y": 521, "t": 0 }, { "id": 54, "x": 667, "y": 522, "t": 0 }, { "id": 55, "x": 738, "y": 518, "t": 1 }, { "id": 56, "x": 113, "y": 598, "t": 1 }, { "id": 57, "x": 188, "y": 598, "t": 0 }, { "id": 58, "x": 263, "y": 598, "t": 0 }, { "id": 59, "x": 338, "y": 598, "t": 0 }, { "id": 60, "x": 523, "y": 598, "t": 0 }, { "id": 61, "x": 591, "y": 597, "t": 0 }, { "id": 62, "x": 667, "y": 598, "t": 1 }, { "id": 63, "x": 738, "y": 594, "t": 0 }, { "id": 64, "x": 113, "y": 679, "t": 0 }, { "id": 65, "x": 188, "y": 679, "t": 1 }, { "id": 66, "x": 263, "y": 679, "t": 0 }, { "id": 67, "x": 338, "y": 679, "t": 0 }, { "id": 68, "x": 523, "y": 679, "t": 0 }, { "id": 69, "x": 591, "y": 678, "t": 1 }, { "id": 70, "x": 667, "y": 679, "t": 0 }, { "id": 71, "x": 738, "y": 675, "t": 0 }, { "id": 72, "x": 115, "y": 764, "t": 0 }, { "id": 73, "x": 190, "y": 764, "t": 0 }, { "id": 74, "x": 265, "y": 764, "t": 1 }, { "id": 75, "x": 340, "y": 764, "t": 0 }, { "id": 76, "x": 525, "y": 764, "t": 1 }, { "id": 77, "x": 593, "y": 763, "t": 0 }, { "id": 78, "x": 669, "y": 764, "t": 0 }, { "id": 79, "x": 740, "y": 760, "t": 0 }, { "id": 80, "x": 110, "y": 843, "t": 0 }, { "id": 81, "x": 185, "y": 843, "t": 1 }, { "id": 82, "x": 260, "y": 843, "t": 0 }, { "id": 83, "x": 335, "y": 843, "t": 0 }, { "id": 84, "x": 520, "y": 843, "t": 0 }, { "id": 85, "x": 588, "y": 842, "t": 0 }, { "id": 86, "x": 664, "y": 843, "t": 0 }, { "id": 87, "x": 735, "y": 839, "t": 1 }, { "id": 88, "x": 115, "y": 922, "t": 0 }, { "id": 89, "x": 190, "y": 922, "t": 0 }, { "id": 90, "x": 265, "y": 922, "t": 0 }, { "id": 91, "x": 340, "y": 922, "t": 1 }, { "id": 92, "x": 525, "y": 922, "t": 0 }, { "id": 93, "x": 593, "y": 921, "t": 0 }, { "id": 94, "x": 669, "y": 922, "t": 1 }, { "id": 95, "x": 740, "y": 918, "t": 0 }] }

CONFIG_PAGE_2_RAW = { "imgWidth": 801, "imgHeight": 1024, "boxW": 50, "boxH": 50, "items": [{ "id": 0, "x": 113, "y": 47, "t": 0 }, { "id": 1, "x": 188, "y": 47, "t": 0 }, { "id": 2, "x": 263, "y": 47, "t": 0 }, { "id": 3, "x": 338, "y": 47, "t": 1 }, { "id": 4, "x": 517, "y": 47, "t": 0 }, { "id": 5, "x": 588, "y": 47, "t": 0 }, { "id": 6, "x": 658, "y": 48, "t": 1 }, { "id": 7, "x": 729, "y": 45, "t": 0 }, { "id": 8, "x": 114, "y": 124, "t": 0 }, { "id": 9, "x": 189, "y": 124, "t": 1 }, { "id": 10, "x": 264, "y": 124, "t": 0 }, { "id": 11, "x": 339, "y": 124, "t": 0 }, { "id": 12, "x": 518, "y": 124, "t": 0 }, { "id": 13, "x": 589, "y": 124, "t": 0 }, { "id": 14, "x": 659, "y": 125, "t": 0 }, { "id": 15, "x": 730, "y": 122, "t": 1 }, { "id": 16, "x": 113, "y": 199, "t": 0 }, { "id": 17, "x": 188, "y": 199, "t": 0 }, { "id": 18, "x": 263, "y": 199, "t": 1 }, { "id": 19, "x": 338, "y": 199, "t": 0 }, { "id": 20, "x": 517, "y": 199, "t": 1 }, { "id": 21, "x": 588, "y": 199, "t": 0 }, { "id": 22, "x": 658, "y": 200, "t": 0 }, { "id": 23, "x": 729, "y": 197, "t": 0 }, { "id": 24, "x": 109, "y": 286, "t": 0 }, { "id": 25, "x": 184, "y": 286, "t": 1 }, { "id": 26, "x": 259, "y": 286, "t": 0 }, { "id": 27, "x": 334, "y": 286, "t": 0 }, { "id": 28, "x": 513, "y": 286, "t": 0 }, { "id": 29, "x": 584, "y": 286, "t": 1 }, { "id": 30, "x": 654, "y": 287, "t": 0 }, { "id": 31, "x": 725, "y": 284, "t": 0 }, { "id": 32, "x": 112, "y": 362, "t": 1 }, { "id": 33, "x": 187, "y": 362, "t": 0 }, { "id": 34, "x": 262, "y": 362, "t": 0 }, { "id": 35, "x": 337, "y": 362, "t": 0 }, { "id": 36, "x": 516, "y": 362, "t": 0 }, { "id": 37, "x": 587, "y": 362, "t": 0 }, { "id": 38, "x": 657, "y": 363, "t": 1 }, { "id": 39, "x": 728, "y": 360, "t": 0 }, { "id": 40, "x": 112, "y": 442, "t": 1 }, { "id": 41, "x": 187, "y": 442, "t": 0 }, { "id": 42, "x": 262, "y": 442, "t": 0 }, { "id": 43, "x": 337, "y": 442, "t": 0 }, { "id": 44, "x": 516, "y": 442, "t": 0 }, { "id": 45, "x": 587, "y": 442, "t": 0 }, { "id": 46, "x": 657, "y": 443, "t": 0 }, { "id": 47, "x": 728, "y": 440, "t": 1 }, { "id": 48, "x": 109, "y": 523, "t": 0 }, { "id": 49, "x": 184, "y": 523, "t": 0 }, { "id": 50, "x": 259, "y": 523, "t": 0 }, { "id": 51, "x": 334, "y": 523, "t": 1 }, { "id": 52, "x": 513, "y": 523, "t": 0 }, { "id": 53, "x": 584, "y": 523, "t": 0 }, { "id": 54, "x": 654, "y": 524, "t": 1 }, { "id": 55, "x": 725, "y": 521, "t": 0 }, { "id": 56, "x": 113, "y": 605, "t": 0 }, { "id": 57, "x": 188, "y": 605, "t": 1 }, { "id": 58, "x": 263, "y": 605, "t": 0 }, { "id": 59, "x": 338, "y": 605, "t": 0 }, { "id": 60, "x": 517, "y": 605, "t": 1 }, { "id": 61, "x": 588, "y": 605, "t": 0 }, { "id": 62, "x": 658, "y": 606, "t": 0 }, { "id": 63, "x": 729, "y": 603, "t": 0 }, { "id": 64, "x": 111, "y": 684, "t": 0 }, { "id": 65, "x": 186, "y": 684, "t": 0 }, { "id": 66, "x": 261, "y": 684, "t": 1 }, { "id": 67, "x": 336, "y": 684, "t": 0 }, { "id": 68, "x": 515, "y": 684, "t": 0 }, { "id": 69, "x": 586, "y": 684, "t": 1 }, { "id": 70, "x": 656, "y": 685, "t": 0 }, { "id": 71, "x": 727, "y": 682, "t": 0 }, { "id": 72, "x": 111, "y": 765, "t": 0 }, { "id": 73, "x": 186, "y": 765, "t": 0 }, { "id": 74, "x": 261, "y": 765, "t": 0 }, { "id": 75, "x": 336, "y": 765, "t": 1 }, { "id": 76, "x": 515, "y": 765, "t": 0 }, { "id": 77, "x": 586, "y": 765, "t": 1 }, { "id": 78, "x": 656, "y": 766, "t": 0 }, { "id": 79, "x": 727, "y": 763, "t": 0 }, { "id": 80, "x": 109, "y": 846, "t": 1 }, { "id": 81, "x": 184, "y": 846, "t": 0 }, { "id": 82, "x": 260, "y": 846, "t": 0 }, { "id": 83, "x": 335, "y": 846, "t": 0 }, { "id": 84, "x": 513, "y": 846, "t": 0 }, { "id": 85, "x": 584, "y": 846, "t": 0 }, { "id": 86, "x": 654, "y": 847, "t": 0 }, { "id": 87, "x": 725, "y": 844, "t": 1 }, { "id": 88, "x": 113, "y": 929, "t": 0 }, { "id": 89, "x": 188, "y": 929, "t": 0 }, { "id": 90, "x": 263, "y": 929, "t": 1 }, { "id": 91, "x": 338, "y": 929, "t": 0 }, { "id": 92, "x": 517, "y": 929, "t": 1 }, { "id": 93, "x": 588, "y": 929, "t": 0 }, { "id": 94, "x": 658, "y": 930, "t": 0 }, { "id": 95, "x": 729, "y": 927, "t": 0 }] }

# Note: In CONFIG_PAGE_2, there are some "text": 1 issues in my manual copy-paste above (lines 51, 54).
# I must fix them to "t": 1 before processing, or handle it in the script.
# Actually I pasted them as "text": 1? No, looking closely at my previous `view_file` (Step 353),
# Line 529 items... { "id": 51 ... "t": 1 }
# Wait, let me check strict JSON validity.
# The user provided JSON had "t": 1.
# My `view_file` output shows "t": 1.
# Ah, I see "text" in my `refactor_config.py` content above? No, I see `t`.
# Wait, I see `{ "id": 51, "x": 334, "y": 523, "t": 1 }` in my thought process?
# No, in `write_to_file` call, I must ensure I use `t`.
# It seems I might have hallucinated "text". Let's painstakingly verify the items in `CONFIG_PAGE_2`.
# ID 51: { "id": 51, "x": 334, "y": 523, "t": 1 }
# ID 54: { "id": 54, "x": 654, "y": 524, "t": 1 }
# Good.

def convert_to_question_structure(config, page_offset_id=0):
    new_config = {
        "imgWidth": config["imgWidth"],
        "imgHeight": config["imgHeight"],
        "boxW": config["boxW"],
        "boxH": config["boxH"],
        "questions": []
    }
    
    items = config["items"]
    # Sort items just in case, though they look sorted
    items.sort(key=lambda x: x["id"])
    
    # Process in chunks of 4
    for i in range(0, len(items), 4):
        chunk = items[i:i+4]
        if len(chunk) < 4:
            break
            
        question_index = i // 4
        
        # Determine global question ID (if we want continuous numbering)
        # But maybe just keep it simple: local index.
        # The user's items define IDs 0..95.
        # So PAGE 1 has items 0..95 (Wait, Page 1 has items 0..95 ?? 24 * 4 = 96 items. Yes.)
        # Page 2 has items 0..95 TOO?
        # Let's check IDs in CONFIG_PAGE_2.
        # They ALSO start at 0 ! { "id": 0 ... }
        # So IDs are NOT unique across pages.
        # This explains why the previous code `const key = this.currentPageIndex + "_" + item.id;` was necessary.
        
        question_obj = {
            "id": question_index, # 0 to 23
            "options": []
        }
        
        for item in chunk:
            option_obj = {
                "id": item["id"], # The local item ID (0-95)
                "x": item["x"],
                "y": item["y"],
                "isCorrect": item["t"] == 1
            }
            question_obj["options"].append(option_obj)
            
        new_config["questions"].append(question_obj)
        
    return new_config

new_page_1 = convert_to_question_structure(CONFIG_PAGE_1_RAW)
new_page_2 = convert_to_question_structure(CONFIG_PAGE_2_RAW)

with open("new_config.js", "w", encoding="utf-8") as f:
    f.write("const CONFIG_PAGE_1 = " + json.dumps(new_page_1) + ";\n")
    f.write("const CONFIG_PAGE_2 = " + json.dumps(new_page_2) + ";\n")
