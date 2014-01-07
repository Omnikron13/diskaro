package com.googlecode.diskaro.library;

import java.sql.SQLException;
import java.util.ArrayList;

public class Tag extends TagCore {
	/**
	 * Returns the name of the primary table used to store tags.
	 * This is primarily so methods such as DataCore.get() can be used.
	 * @return primary table name - "tags"
	 */
	public static String table() {
		return "tags";
	}
	protected String getTable() {
		return table();
	}
	protected String getRelationshipTable() {
		return "subTags";
	}
	
	/**
	 * Loads a tag from the database by a specified uid
	 * @param id the internal uid
	 * @throws SQLException
	 */
	public Tag(int id) throws SQLException {
		super(id);
	}
	
	/**
	 * Loads a specified tag from the database, returning a Tag object that can be used to
	 * manipulate the tag.
	 * @param name	human name of the existing tag
	 * @throws SQLException
	 */
	public Tag(String name) throws SQLException {
		super(name);
	}
	
	/**
	 * Adds a new tag entry to the database, and returns a corresponding Tag object
	 * that can be used to manipulate the new tag.
	 * @param name name of the new tag to be created
	 * @return Tag object representing the newly added tag
	 */
	public static Tag add(String name) throws SQLException {
		return new Tag(add(name, table()));
	}
	
	/**
	 * Returns an ArrayList of Tag objects of all the tags in the database.
	 * @return the list
	 * @throws Exception
	 */
	public static ArrayList<Tag> get() throws Exception {
		return (ArrayList<Tag>)get(Tag.class);
	}
}