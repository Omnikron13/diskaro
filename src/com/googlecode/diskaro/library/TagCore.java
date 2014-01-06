/**
 * 
 */
package com.googlecode.diskaro.library;

import java.lang.reflect.Constructor;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;

import javax.swing.table.TableStringConverter;

/**
 * @author S4T4N
 * This class provides core functionality shared by tags and
 * tag-like (genre, label, etc.) library data.
 */
public abstract class TagCore extends DataCore {
	public enum ParentMode {
		DIRECT, RECURSIVE
	}
	
	//Allows sub-classes to identify their main db table
	protected abstract String getTable();
	//Allows sub-classes to identify their relationship db table
	protected abstract String getRelationshipTable();
	
	protected static Statements addStatements = new Statements("INSERT INTO <t0> (name) VALUES (?);");
		
	//Prepared SQL Statement for easily adding parent links - perhaps refactor to reuse Statements class logic above
	protected PreparedStatement addParentStatement = null;
	protected PreparedStatement addParentStatement() throws SQLException {
		if(addParentStatement == null) {
			addParentStatement = Library.getDB().prepareStatement("INSERT INTO "+getRelationshipTable()+" (parentID, childID) VALUES (?, ?);");
			addParentStatement.setInt(2, this.id);
		}
		return addParentStatement;
	}
	//Prepared SQL statement for counting parents - as above ^
	protected PreparedStatement countParentsStatement = null;
	protected PreparedStatement countParentsStatement() throws SQLException {
		if(countParentsStatement == null) {
			countParentsStatement = Library.getDB().prepareStatement("SELECT count(*) AS count FROM "+getRelationshipTable()+" WHERE childID = ?;");
			countParentsStatement.setInt(1, id);
		}
		return countParentsStatement;
	}
	
	//Prepared SQL statement for fetching parents from the db - as above ^, especially for this one!
	protected PreparedStatement getParentsStatement = null;
	protected PreparedStatement getParentsStatement() throws SQLException {
		if(getParentsStatement == null) {
			getParentsStatement = Library.getDB().prepareStatement(
					"SELECT " + getTable() + ".id, name FROM " +getTable() + ", " + getRelationshipTable() + 
					" WHERE " + getRelationshipTable() + ".childID = ? AND " + getRelationshipTable() +
					".parentID = " + getTable() + ".id;");
			getParentsStatement.setInt(1, id);
		}
		return getParentsStatement;
	}
	
	/**
	 * Returns the fully qualified name of the tag/genre/etc.
	 * @return String of the fully qualified name
	 * @throws Exception
	 */
	public String getFullName() throws Exception {
		String fullName = name;
		for(TagCore parent : getParents(ParentMode.RECURSIVE)) {
			fullName += '/' + parent.getName();
		}
		return fullName;
	}
	
	/**
	 * Returns an ArrayList of TagCore objects representing the tag/genre/etc's. parents
	 * @return ArrayList<TagCore> holding unique parent/grandparent/etc. objects
	 * @throws SQLException
	 * @throws NoSuchMethodException
	 * @throws Exception
	 */
	public ArrayList<TagCore> getParents(ParentMode mode) throws SQLException, NoSuchMethodException, Exception {
		ResultSet rs = getParentsStatement().executeQuery();
		ArrayList<TagCore> parents = new ArrayList<TagCore>(5);
		while(rs.next()) {
			TagCore parent = newInstanceByID(rs.getInt("id"));
			parents.add(parent);
		}
		if(mode == ParentMode.DIRECT) {
			return parents;
		}
		ArrayList<TagCore> grandparents = new ArrayList<TagCore>(5);
		//Load all grandparents, including duplicates
		for(TagCore parent : parents) {
			grandparents.addAll(parent.getParents(ParentMode.RECURSIVE));
		}
		//Merge all grandparents into the parents array, removing duplicates from the left
		for(TagCore grandparent : grandparents) {
			int x = parents.indexOf(grandparent);
			if(x != -1) {
				parents.remove(x);
			}
			parents.add(grandparent);
		}
		return parents;
	}
	
	/**
	 * Equivalent of getParents(ParentMode.DIRECT)
	 * @see getParents(ParentMode mode)
	 * @return ArrayList<TagCore> holding parent objects
	 * @throws SQLException
	 * @throws Exception
	 */
	public ArrayList<TagCore> getParents() throws SQLException, Exception {
		return getParents(ParentMode.DIRECT);
	}
	
	//Generates an ArrayList of the uids of parents, either direct or recursively,
	//eliminating duplicates to the left.
	protected ArrayList<Integer> getParentIDs() throws SQLException {
		ResultSet rs = getParentsStatement().executeQuery();
		ArrayList<Integer> parents = new ArrayList<Integer>(5);
		while(rs.next()) {
			parents.add(rs.getInt("id"));
			System.out.println("Foo: " + getClass());
		}
		return parents;
	}
	
	protected TagCore(int id) throws SQLException {
		getByIDStatements.fetch(getTable()).setInt(1, id);
		ResultSet rs = getByIDStatements.fetch(getTable()).executeQuery();
		this.name = rs.getString("name");
		this.id = id;
	}
	
	protected TagCore(String name) throws SQLException {
		getByNameStatements.fetch(getTable()).setString(1, name);
		ResultSet rs = getByNameStatements.fetch(getTable()).executeQuery();
		this.name = name;
		this.id = rs.getInt("id");
	}
	
	//Adds a new tag/genre/etc. to the database
	protected static void add(String name, String table) throws SQLException {
		addStatements.fetch(table).setString(1, name);
		addStatements.fetch(table).executeUpdate();
	}
	
	/**
	 * Adds a parent reference to the tag/genre/etc. to the database
	 * @param parent uid of the parent tag/etc.
	 * @throws Exception
	 */
	public void addParent(int parent) throws Exception {
		addParent(newInstanceByID(parent));
	}
	
	/**
	 * Adds a parent reference to the tag/genre/etc. to the database
	 * @param parent human name of the parent tag/etc.
	 * @throws Exception
	 */
	public void addParent(String parent) throws Exception {
		addParent(newInstanceByName(parent));
	}
	
	/**
	 * Adds a parent reference to the tag/genre/etc.
	 * @param parent TagCore (or sub-class) object representing the parent tag/genre/etc.
	 * @throws SQLException
	 */
	public void addParent(TagCore parent) throws SQLException {
		addParentStatement().setInt(1, parent.getID());
		addParentStatement().executeUpdate();
	}
	
	//Returns the id-based constructor of the calling subclass - may not be needed?
	protected Constructor<?> getIDConstructor() throws NoSuchMethodException {
		return getClass().getConstructor(int.class);
	}
		
	//Returns the name-based constructor of the calling subclass - as above ^
	protected Constructor<?> getNameConstructor() throws NoSuchMethodException {
		return getClass().getConstructor(String.class);
	}
	
	//Returns a new instance of the calling SUB-class by id
	protected TagCore newInstanceByID(int id) throws Exception {
		return getClass().getConstructor(int.class).newInstance(id);
	}
	
	//Returns a new instance of the calling SUB-class by name
	protected TagCore newInstanceByName(String name) throws Exception {
		return getClass().getConstructor(String.class).newInstance(name);
	}
}
