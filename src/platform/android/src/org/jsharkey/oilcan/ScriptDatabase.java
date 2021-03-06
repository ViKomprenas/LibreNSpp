/*
	Copyright (C) 2008 Jeffrey Sharkey, http://jsharkey.org/
	
	This program is free software: you can redistribute it and/or modify
	it under the terms of the GNU General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.
	
	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU General Public License for more details.
	
	You should have received a copy of the GNU General Public License
	along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

package org.jsharkey.oilcan;

import java.io.InputStream;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.json.JSONArray;
import org.json.JSONObject;

import android.content.ContentValues;
import android.content.Context;
import android.content.res.Resources;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteOpenHelper;
import android.util.Log;

public class ScriptDatabase extends SQLiteOpenHelper {
	
	public final static String TAG = ScriptDatabase.class.toString();
	
	public final static String DB_NAME = "scripts";
	public final static int DB_VERSION = 3;
	
	public final static String TABLE_SCRIPTS = "scripts";
	public final static String FIELD_SCRIPT_NAME = "title";
	public final static String FIELD_SCRIPT_AUTHOR = "author";
	public final static String FIELD_SCRIPT_DESCRIP = "descrip";
	public final static String FIELD_SCRIPT_DOMAINREGEX = "domain";
	public final static String FIELD_SCRIPT_CONTENT = "content";
	public final static String FIELD_SCRIPT_ENABLED = "enabled";
	
	private final Resources res;

	public ScriptDatabase(Context context) {
		super(context, DB_NAME, null, DB_VERSION);
		this.res = context.getResources();
	}

	public void onCreate(SQLiteDatabase db) {
		db.execSQL("CREATE TABLE " + TABLE_SCRIPTS
				+ " (_id INTEGER PRIMARY KEY, "
				+ FIELD_SCRIPT_NAME + " TEXT, "
				+ FIELD_SCRIPT_AUTHOR + " TEXT, "
				+ FIELD_SCRIPT_DESCRIP + " TEXT, "
				+ FIELD_SCRIPT_DOMAINREGEX + " TEXT, "
				+ FIELD_SCRIPT_CONTENT + " TEXT, "
				+ FIELD_SCRIPT_ENABLED + " INTEGER)");

		// populate database with a few example scripts 
		try {
			this.insertScript(db, Util.getRawString(res, R.raw.librenspp));
		} catch(Exception e) {
			Log.e(TAG, "Problem while inserting default scripts", e);
		}
		
		
	}

	public void onUpgrade(SQLiteDatabase db, int oldVersion, int newVersion) {
		int currentVersion = oldVersion;
		
		if(currentVersion != newVersion) {
			db.execSQL("DROP TABLE IF EXISTS " + TABLE_SCRIPTS);
			onCreate(db);	
		}
	}
	
	public static Pattern headerRegex = Pattern.compile("^// @([^\\s]+)\\s+(.+?)$", Pattern.MULTILINE);
	public final static String UNKNOWN = "Unknown";
	
	/**
	 * Format a domain "include" statement so it behaves nicely as a Java regex.
	 */
	public static String formatDomain(String domain) {
		
		// escape any "." and replace "*" with generic matcher
		domain = domain.replace(".", "\\.");
		domain = domain.replace("*", ".*");
		return domain;
		
	}
	
	/**
	 * Import the given script into our database.
	 * @throws Exception if problem parsing script 
	 */
	public long insertScript(SQLiteDatabase db, String raw) throws Exception {
		if(db == null) db = this.getWritableDatabase();
		
		// extract metadata from script comments
		String name = UNKNOWN, author = UNKNOWN, descrip = UNKNOWN;
		StringBuilder include = new StringBuilder();
		include.append('(');
		
		try {
			Matcher matcher = headerRegex.matcher(raw);
			while(matcher.find()) {
				String key = matcher.group(1),
					value = matcher.group(2);
				
				Log.d(TAG, String.format("found header %s=%s", key, value));

				if("name".equals(key)) {
					name = value;
				} else if("author".equals(key)) {
					author = value;
				} else if("description".equals(key)) {
					descrip = value;
				} else if("match".equals(key)) {
					include.append(formatDomain(value));
					include.append('|');
				}
			}
		} catch(Exception e) {
			Log.e(TAG, "Problem while parsing script header", e);
		}
		
		String domainregex = "";
		if(include.length() > 0) {
			// replace last '|' with a closing bracket
			include.setCharAt(include.length() - 1, ')');
			domainregex = include.toString();
		}
		
		// script is valid if has name and parsable domain regex
		if(UNKNOWN.equals(name))
			throw new Exception("No name found in script");
		
		try {
			Pattern.compile(domainregex);
		} catch(Exception e) {
			throw new Exception("Problem parsing domain regex", e);
		}
		
		//Log.d(TAG, String.format("domainregex=%s", domainregex));

		ContentValues values = new ContentValues();
		values.put(FIELD_SCRIPT_NAME, name);
		values.put(FIELD_SCRIPT_AUTHOR, author);
		values.put(FIELD_SCRIPT_DESCRIP, descrip);
		values.put(FIELD_SCRIPT_DOMAINREGEX, domainregex);
		values.put(FIELD_SCRIPT_CONTENT, raw);
		values.put(FIELD_SCRIPT_ENABLED, 1);
	
		return db.insert(TABLE_SCRIPTS, null, values);
		
	}
	
	/**
	 * Return cursor across all scripts.
	 */
	public Cursor getScripts() {
		SQLiteDatabase db = this.getReadableDatabase();
		return db.query(TABLE_SCRIPTS, new String[] { "_id", FIELD_SCRIPT_NAME,
				FIELD_SCRIPT_AUTHOR, FIELD_SCRIPT_DESCRIP, FIELD_SCRIPT_DOMAINREGEX,
				FIELD_SCRIPT_ENABLED }, null, null, null, null, null);
		
	}
	
	/**
	 * Delete a specific script.
	 */
	public void deleteScript(long id) {
		SQLiteDatabase db = this.getWritableDatabase();		
		db.delete(TABLE_SCRIPTS, "_id = ?", new String[] { Long.toString(id) });
		
	}
	
	/**
	 * Toggle the enabled state of the given script.
	 */
	public void toggleEnabled(long id) {
		SQLiteDatabase db = this.getWritableDatabase();
		
		// first read the existing status
		Cursor cur = db.query(TABLE_SCRIPTS, new String[] { FIELD_SCRIPT_ENABLED }, "_id = ?", new String[] { Long.toString(id) }, null, null, null);
		if(cur == null || !cur.moveToFirst()) return;
		int value = cur.getInt(cur.getColumnIndex(FIELD_SCRIPT_ENABLED));
		cur.close();

		// update to have the opposite value
		ContentValues values = new ContentValues();
		values.put(FIELD_SCRIPT_ENABLED, (value == 0) ? 1 : 0);
		db.update(TABLE_SCRIPTS, values, "_id = ?", new String[] { Long.toString(id) });
		
	}
	
	private Map<Pattern,String> cache = new HashMap<Pattern,String>();
	
	private void validateCache() {
		
		SQLiteDatabase db = this.getReadableDatabase();
		Cursor cur = db.query(TABLE_SCRIPTS, new String[] { FIELD_SCRIPT_DOMAINREGEX,
				FIELD_SCRIPT_CONTENT }, FIELD_SCRIPT_ENABLED + " = 1", null, null, null, null);
		
		int COL_DOMAINREGEX = cur.getColumnIndex(FIELD_SCRIPT_DOMAINREGEX),
			COL_CONTENT = cur.getColumnIndex(FIELD_SCRIPT_CONTENT);
		
		cache.clear();
		
		while(cur.moveToNext()) {
			String domainregex = cur.getString(COL_DOMAINREGEX),
				content = cur.getString(COL_CONTENT);
			cache.put(Pattern.compile(domainregex), content);
			
		}
		
		cur.close();
		
	}

	/**
	 * Return Javascript (CONTENT) for all scripts that should be active given
	 * this specific url.
	 */
	public List<String> getActive(String url) {
		List<String> active = new LinkedList<String>();
		
		this.validateCache();
		for(Pattern trial : cache.keySet()) {
			if(trial.matcher(url).matches())
				active.add(cache.get(trial));
		}
		
		return active;
	}
	
	

}
